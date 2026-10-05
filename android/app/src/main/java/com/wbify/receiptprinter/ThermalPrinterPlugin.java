package com.wbify.receiptprinter;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(
    name = "ThermalPrinter",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = { Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN }
        )
    }
)
public class ThermalPrinterPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private final AtomicBoolean printing = new AtomicBoolean(false);

    private boolean needsPermission() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
            && getPermissionState("bluetooth") != PermissionState.GRANTED;
    }

    @PluginMethod
    public void listPaired(PluginCall call) {
        if (needsPermission()) {
            requestPermissionForAlias("bluetooth", call, "listPermissionResult");
            return;
        }
        listPairedNow(call);
    }

    @PermissionCallback
    private void listPermissionResult(PluginCall call) {
        if (needsPermission()) call.reject("Bluetooth permission is required.");
        else listPairedNow(call);
    }

    private void listPairedNow(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null) { call.reject("Bluetooth is not supported on this device."); return; }
        if (!adapter.isEnabled()) { call.reject("Turn on Bluetooth, then try again."); return; }

        Set<BluetoothDevice> devices = adapter.getBondedDevices();
        JSArray result = new JSArray();
        for (BluetoothDevice device : devices) {
            JSObject item = new JSObject();
            item.put("name", device.getName() == null ? "Bluetooth printer" : device.getName());
            item.put("address", device.getAddress());
            result.put(item);
        }
        JSObject response = new JSObject();
        response.put("devices", result);
        call.resolve(response);
    }

    @PluginMethod
    public void printImage(PluginCall call) {
        if (needsPermission()) {
            requestPermissionForAlias("bluetooth", call, "printPermissionResult");
            return;
        }
        printImageNow(call);
    }

    @PluginMethod
    public void saveImage(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Saving to the gallery requires Android 10 or newer.");
            return;
        }
        String dataUrl = call.getString("dataUrl");
        String fileName = call.getString("fileName", "receipt.png");
        if (dataUrl == null) { call.reject("Receipt image is required."); return; }

        try {
            byte[] imageBytes = Base64.decode(dataUrl.substring(dataUrl.indexOf(',') + 1), Base64.DEFAULT);
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Receipt Printer");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            ContentResolver resolver = getContext().getContentResolver();
            Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new Exception("Could not create the gallery image.");
            try (OutputStream output = resolver.openOutputStream(uri)) {
                if (output == null) throw new Exception("Could not open the gallery image.");
                output.write(imageBytes);
            }
            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            resolver.update(uri, values, null, null);
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception error) {
            call.reject(error.getMessage() == null ? "Could not save the receipt image." : error.getMessage());
        }
    }

    @PermissionCallback
    private void printPermissionResult(PluginCall call) {
        if (needsPermission()) call.reject("Bluetooth permission is required.");
        else printImageNow(call);
    }

    private void printImageNow(PluginCall call) {
        String address = call.getString("address");
        String dataUrl = call.getString("dataUrl");
        if (address == null || dataUrl == null) { call.reject("Printer and receipt image are required."); return; }
        if (!printing.compareAndSet(false, true)) {
            call.reject("A receipt is already printing. Please wait for it to finish.");
            return;
        }

        new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null || !adapter.isEnabled()) throw new Exception("Turn on Bluetooth, then try again.");

                BluetoothDevice device = adapter.getRemoteDevice(address);
                socket = connectBluetoothSocket(adapter, device);

                byte[] imageBytes = Base64.decode(dataUrl.substring(dataUrl.indexOf(',') + 1), Base64.DEFAULT);
                Bitmap source = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
                if (source == null) throw new Exception("Could not read the receipt image.");
                int width = 384;
                int height = Math.max(1, Math.round(source.getHeight() * (width / (float) source.getWidth())));
                Bitmap bitmap = Bitmap.createScaledBitmap(source, width, height, true);

                OutputStream output = socket.getOutputStream();
                output.write(new byte[] { 0x1B, 0x40 });
                output.write(toEscPosRaster(bitmap));
                output.write(new byte[] { 0x0A, 0x0A, 0x0A, 0x0A });
                output.flush();
                bitmap.recycle();
                if (source != bitmap) source.recycle();
                call.resolve();
            } catch (Exception error) {
                call.reject(error.getMessage() == null ? "Printer connection failed." : error.getMessage());
            } finally {
                try { if (socket != null) socket.close(); } catch (Exception ignored) {}
                printing.set(false);
            }
        }, "thermal-printer-thread").start();
    }

    private BluetoothSocket connectBluetoothSocket(BluetoothAdapter adapter, BluetoothDevice device) throws IOException {
        IOException firstFailure = null;
        for (int attempt = 0; attempt < 2; attempt++) {
            BluetoothSocket candidate = null;
            boolean connected = false;
            try {
                candidate = attempt == 0
                    ? device.createRfcommSocketToServiceRecord(SPP_UUID)
                    : device.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
                adapter.cancelDiscovery();
                candidate.connect();
                connected = true;
                return candidate;
            } catch (IOException error) {
                if (firstFailure == null) firstFailure = error;
                else firstFailure.addSuppressed(error);
            } finally {
                if (candidate != null && !connected) {
                    try { candidate.close(); } catch (IOException ignored) {}
                }
            }
        }
        throw new IOException(
            "Could not connect to the printer. Make sure it is powered on and nearby, "
                + "disconnect it from other apps or phones, and check the selected printer in Store Setup. "
                + "If it still fails, pair the printer again in Android Bluetooth settings.",
            firstFailure
        );
    }

    private byte[] toEscPosRaster(Bitmap bitmap) throws Exception {
        int widthBytes = (bitmap.getWidth() + 7) / 8;
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        bytes.write(new byte[] {
            0x1D, 0x76, 0x30, 0x00,
            (byte) (widthBytes & 0xff), (byte) ((widthBytes >> 8) & 0xff),
            (byte) (bitmap.getHeight() & 0xff), (byte) ((bitmap.getHeight() >> 8) & 0xff)
        });
        for (int y = 0; y < bitmap.getHeight(); y++) {
            for (int xByte = 0; xByte < widthBytes; xByte++) {
                int value = 0;
                for (int bit = 0; bit < 8; bit++) {
                    int x = xByte * 8 + bit;
                    if (x >= bitmap.getWidth()) continue;
                    int color = bitmap.getPixel(x, y);
                    int alpha = (color >>> 24) & 0xff;
                    int luminance = (((color >> 16) & 0xff) * 299 + ((color >> 8) & 0xff) * 587 + (color & 0xff) * 114) / 1000;
                    if (alpha > 32 && luminance < 170) value |= 1 << (7 - bit);
                }
                bytes.write(value);
            }
        }
        return bytes.toByteArray();
    }
}

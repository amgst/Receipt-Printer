package com.wbify.receiptprinter;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
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
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "ThermalPrinter",
    permissions = { @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_CONNECT }) }
)
public class ThermalPrinterPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

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

    @PermissionCallback
    private void printPermissionResult(PluginCall call) {
        if (needsPermission()) call.reject("Bluetooth permission is required.");
        else printImageNow(call);
    }

    private void printImageNow(PluginCall call) {
        String address = call.getString("address");
        String dataUrl = call.getString("dataUrl");
        if (address == null || dataUrl == null) { call.reject("Printer and receipt image are required."); return; }

        new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null || !adapter.isEnabled()) throw new Exception("Turn on Bluetooth, then try again.");
                BluetoothDevice device = adapter.getRemoteDevice(address);
                socket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                adapter.cancelDiscovery();
                socket.connect();

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
                socket.close();
                call.resolve();
            } catch (Exception error) {
                try { if (socket != null) socket.close(); } catch (Exception ignored) {}
                call.reject(error.getMessage() == null ? "Printer connection failed." : error.getMessage());
            }
        }).start();
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

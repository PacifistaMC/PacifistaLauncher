package fr.pacifista.launcher.utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class FileDownload extends Thread {

    private final String downloadUrl;
    private final String destinationFile;
    private int progress;
    private boolean isCancelled;
    private boolean downloadDone;

    public FileDownload(final String downloadUrl, final String destinationFile) {
        this.downloadUrl = downloadUrl;
        this.destinationFile = destinationFile;
        this.progress = 0;
        this.isCancelled = false;
        this.downloadDone = false;
    }

    @Override
    public void run() {
        InputStream inputStream = null;
        OutputStream outputStream = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(this.downloadUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.connect();

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new Exception("Server not ok: code " + connection.getResponseCode());
            }

            File file = new File(this.destinationFile);
            if (file.exists() && !file.delete()) {
                throw new Exception("Message d'erreur: Impossible de supprimer le fichier " + file.getName());
            }
            inputStream = connection.getInputStream();
            outputStream = new FileOutputStream(this.destinationFile);

            byte[] data = new byte[4096];
            int fileSize = connection.getContentLength();
            long total = 0;
            int count;
            while ((count = inputStream.read(data)) != -1) {
                if (this.isCancelled)
                    return;
                total += count;
                if (fileSize > 0)
                    this.progress = (int) (total * 100 / fileSize);
                outputStream.write(data, 0, count);
            }
            this.downloadDone = true;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (inputStream != null)
                    inputStream.close();
                if (outputStream != null)
                    outputStream.close();
                if (connection != null)
                    connection.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public int getDownloadProgression() {
        return progress;
    }

    public void cancelDownload() {
        this.isCancelled = true;
    }

    public boolean isDownloadDone() {
        return this.downloadDone && !this.isCancelled;
    }
}

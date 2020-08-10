package fr.pacifista.launcheur.backend;

public class MojangFile {

    private final String downloadUrl;
    private final String fileName;
    private final double fileSize;

    MojangFile(final String downloadUrl, final double fileSize) {
        this.downloadUrl = downloadUrl;
        this.fileSize = fileSize;
        this.fileName = parseFileName(downloadUrl);
    }

    private String parseFileName(final String url) {
        char[] str = url.toCharArray();
        StringBuilder buffer = new StringBuilder();
        int slashPos = 0;

        for (int i = 0; i < str.length; ++i) {
            if (str[i] == '/')
                slashPos = i;
        }
        ++slashPos;
        for (int i = slashPos; i < str.length; ++i) {
            buffer.append(str[i]);
        }
        return buffer.toString();
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public double getFileSize() {
        return fileSize;
    }

    public String getFileName() {
        return fileName;
    }
}

package fr.pacifista.launcher.utils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class FileActions {

    public static String getFileContent(File file) throws IOException {
        FileInputStream fis = null;

        try {
            if (!file.exists())
                throw new IOException("The file is not created");
            fis = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            if (fis.read(data) == -1)
                throw new IOException("Error while reading file");
            return new String(data, StandardCharsets.UTF_8);
        } finally {
            if (fis != null)
                fis.close();
        }
    }

    public static void extractAllArchive(final String archivePath, final File destinationFile) throws IOException {
        FileOutputStream fos = null;
        ZipInputStream zis = null;

        try {
            byte[] buffer = new byte[4096];
            zis = new ZipInputStream(new FileInputStream(archivePath));
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                File newFile = new File(destinationFile, zipEntry.getName());
                if (!newFile.getName().endsWith(".so")) {
                    zipEntry = zis.getNextEntry();
                    continue;
                }
                fos = new FileOutputStream(newFile);
                int len;
                while ((len = zis.read(buffer)) > 0)
                    fos.write(buffer, 0, len);
                zipEntry = zis.getNextEntry();
            }
        } finally {
            if (fos != null)
                fos.close();
            if (zis != null) {
                zis.closeEntry();
                zis.close();
            }
        }
    }

    public static void writeInFile(File file, String toWrite, boolean append) throws IOException {
        FileWriter fw = new FileWriter(file.getAbsoluteFile(), append);
        fw.write(toWrite);
        fw.close();
    }

}

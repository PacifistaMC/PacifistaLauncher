package fr.pacifista.launcher.utils;

import java.io.*;
import java.nio.charset.StandardCharsets;

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

    public static void writeInFile(File file, String toWrite, boolean append) throws IOException {
        FileWriter fw = new FileWriter(file.getAbsoluteFile(), append);
        fw.write(toWrite);
        fw.close();
    }

}

package fr.pacifista.launcher.utils;

import java.io.*;

public class StreamGobbler extends Thread
{
    InputStream is;
    String type;
    PrintStream out;

    public StreamGobbler(InputStream is, String type, PrintStream out) {
        this.is = is;
        this.type = type;
        this.out = out;
    }

    public void run() {
        InputStreamReader isr = null;
        BufferedReader br = null;

        try {
            isr = new InputStreamReader(is);
            br = new BufferedReader(isr);
            String line;
            while ((line = br.readLine()) != null)
               out.println("[" + type + "]" + " > " + line);
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } finally {
            try {
                if (isr != null)
                    isr.close();
                if (br != null)
                    br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

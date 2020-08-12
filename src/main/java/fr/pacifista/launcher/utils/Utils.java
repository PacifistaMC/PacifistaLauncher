package fr.pacifista.launcher.utils;

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class Utils {

    public static JsonElement getJsonResponseFromURL(final String urlStr) throws IOException {
        InputStreamReader inputStream = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(urlStr);
            connection = (HttpURLConnection) url.openConnection();
            connection.connect();

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK)
                throw new IOException("Le serveur rencontre une erreur. (Erreur " + connection.getResponseMessage() + ")");
            inputStream = new InputStreamReader(connection.getInputStream());

            return JsonParser.parseReader(inputStream);
        } finally {
            try {
                if (inputStream != null)
                    inputStream.close();
                if (connection != null)
                    connection.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

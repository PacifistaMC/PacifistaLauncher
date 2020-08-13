package fr.pacifista.launcher.backend;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import fr.pacifista.launcher.backend.launch.Pacifista;
import fr.pacifista.launcher.utils.FileActions;
import fr.pacifista.launcher.utils.LauncherException;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public class MojangAuth {

    private static final String URL_MOJANG_AUTH = "https://authserver.mojang.com";
    private static final File authFile = new File(Pacifista.DATA_FOLDER, "login.json");

    private String accessToken;
    private String clientToken;
    private String userName;
    private String userUUID;

    private MojangAuth(final String email, final String password) throws LauncherException, IOException {
        InputStreamReader inputStream = null;
        OutputStream outputStream = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(URL_MOJANG_AUTH + "/authenticate");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; " + StandardCharsets.UTF_8);
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);

            outputStream = connection.getOutputStream();
            String jsonToSend = "{\"agent\": {\"name\": \"Minecraft\", \"version\": 1}, \"username\": \"" + email + "\", \"password\": \"" + password + "\", \"clientToken\": \"" + getClientTokenLauncher() + "\", \"requestUser\": true}";
            byte[] toSend = jsonToSend.getBytes(StandardCharsets.UTF_8);
            outputStream.write(toSend, 0, toSend.length);

            connection.connect();

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new LauncherException(new String[] {
                        "Une erreur est survenue lors de la connexion.",
                        connection.getResponseMessage()
                });
            }

            inputStream = new InputStreamReader(connection.getInputStream());
            JsonObject json = JsonParser.parseReader(inputStream).getAsJsonObject();
            this.accessToken = json.get("accessToken").getAsString();
            this.clientToken = json.get("clientToken").getAsString();
            JsonObject selectedProfile = json.get("selectedProfile").getAsJsonObject();
            this.userName = selectedProfile.get("name").getAsString();
            this.userUUID = selectedProfile.get("id").getAsString();
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

    public void refresh() throws LauncherException {
        InputStreamReader inputStream = null;
        OutputStream outputStream = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(URL_MOJANG_AUTH + "/refresh");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; " + StandardCharsets.UTF_8);
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);

            outputStream = connection.getOutputStream();
            String jsonToSend = "{\"accessToken\": \"" + this.accessToken + "\", \"clientToken\": \"" + this.clientToken + "\", \"requestUser\": true}";
            byte[] toSend = jsonToSend.getBytes(StandardCharsets.UTF_8);
            outputStream.write(toSend, 0, toSend.length);

            connection.connect();

            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new LauncherException(new String[] {
                        "Une erreur est survenue lors de la connexion.",
                        connection.getResponseMessage(),
                });
            }

            inputStream = new InputStreamReader(connection.getInputStream());
            JsonObject json = JsonParser.parseReader(inputStream).getAsJsonObject();
            this.accessToken = json.get("accessToken").getAsString();
            this.clientToken = json.get("clientToken").getAsString();
            JsonObject selectedProfile = json.get("selectedProfile").getAsJsonObject();
            this.userName = selectedProfile.get("name").getAsString();
            this.userUUID = selectedProfile.get("id").getAsString();
            saveLogins(this);
        } catch (IOException e) {
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

    public boolean validate() {
        OutputStream outputStream = null;
        HttpURLConnection connection = null;

        try {
            URL url = new URL(URL_MOJANG_AUTH + "/validate");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; " + StandardCharsets.UTF_8);
            connection.setRequestProperty("Accept", "application/json");
            connection.setDoOutput(true);

            outputStream = connection.getOutputStream();
            String jsonToSend = "{\"accessToken\": \"" + this.accessToken + "\", \"clientToken\": \"" + this.clientToken + "\"}";
            byte[] toSend = jsonToSend.getBytes(StandardCharsets.UTF_8);
            outputStream.write(toSend, 0, toSend.length);

            connection.connect();

            return connection.getResponseCode() == HttpURLConnection.HTTP_NO_CONTENT;
        } catch (IOException e) {
            return false;
        } finally {
            try {
                if (outputStream != null)
                    outputStream.close();
                if (connection != null)
                    connection.disconnect();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private MojangAuth() throws IOException {
        JsonObject json = JsonParser.parseString(FileActions.getFileContent(authFile)).getAsJsonObject();
        this.clientToken = json.get("clientToken").getAsString();
        this.accessToken = json.get("accessToken").getAsString();
        this.userUUID = json.get("userUUID").getAsString();
        this.userName = json.get("userName").getAsString();
    }

    private String getClientTokenLauncher() throws LauncherException {
        try {
            String uuid;
            File tokenFile = new File(Pacifista.DATA_FOLDER, "clientToken.txt");
            if (!tokenFile.exists()) {
                if (!tokenFile.createNewFile())
                    throw new IOException();
                uuid = UUID.randomUUID().toString();
                FileActions.writeInFile(tokenFile, uuid, false);
            } else
                uuid = FileActions.getFileContent(tokenFile);
            return uuid;
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Une erreur est survenue lors de a génération du token client.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getClientToken() {
        return clientToken;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserUUID() {
        return userUUID;
    }

    public static MojangAuth login() throws IOException {
        if (authFile.exists()) {
            return new MojangAuth();
        } else
            return null;
    }

    public static MojangAuth login(final String email, final String password) throws LauncherException, IOException {
        MojangAuth mojangAuth = new MojangAuth(email, password);
        saveLogins(mojangAuth);
        return mojangAuth;
    }

    private static void saveLogins(MojangAuth mojangAuth) throws IOException {
        String json = "{\"accessToken\": \"" + mojangAuth.getAccessToken() + "\", " +
                "\"clientToken\": \"" + mojangAuth.getClientToken() + "\", " +
                "\"userName\": \"" + mojangAuth.getUserName() + "\", " +
                "\"userUUID\": \"" + mojangAuth.getUserUUID() + "\"}";
        FileActions.writeInFile(authFile, json, false);
    }
}

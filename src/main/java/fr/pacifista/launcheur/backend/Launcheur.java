package fr.pacifista.launcheur.backend;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.pacifista.launcheur.Main;
import fr.pacifista.launcheur.utils.LauncherException;
import fr.pacifista.launcheur.utils.OsType;
import fr.pacifista.launcheur.utils.Utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class Launcheur {

    public static final String VERSION_LIST = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
    public static final String RESSOURCE_URL = "https://resources.download.minecraft.net";
    public static final File DATA_FOLDER = new File("." + File.separator + "data");
    public static final File GAME_LIB_FOLDER = new File(DATA_FOLDER, "gameLibs");
    public static final File GAME_FODER = new File(DATA_FOLDER, ".pacifista");
    public static final File GAME_ASSETS_FOLDER = new File(GAME_FODER, "assets");

    private final String launcherVersion;
    private final String gameVersion;
    private final String metaUrlGameVersion;
    private final OsType osType;
    private final Main main;

    public Launcheur(Main main) throws LauncherException {
        this.main = main;
        try {
            final String osType = System.getProperty("os.name").toLowerCase();
            if (osType.contains("win"))
                this.osType = OsType.WINDOWS;
            else if (osType.contains("mac"))
                this.osType = OsType.MAC_OS;
            else if (osType.contains("nux"))
                this.osType = OsType.LINUX;
            else
                throw new Exception("Votre os n'est pas supporté pour jouer à Minecraft");
            final Properties properties = new Properties();
            properties.load(main.getClass().getClassLoader().getResourceAsStream("launcheur.properties"));
            this.launcherVersion = properties.getProperty("launcherVersion");
            this.gameVersion = properties.getProperty("gameVersion");
            this.metaUrlGameVersion = getUrlActualGameVersion();
            if (!DATA_FOLDER.exists() && !DATA_FOLDER.mkdir())
                throw new IOException("Impossible de créer le dossier data.");
            if (!GAME_LIB_FOLDER.exists() && !GAME_LIB_FOLDER.mkdir())
                throw new IOException("Impossible de créer le dossier des librairies du jeu.");
            if (!GAME_FODER.exists() && !GAME_FODER.mkdir())
                throw new IOException("Impossible de créer le dossier .minecraft.");
            if (!GAME_ASSETS_FOLDER.exists() && !GAME_ASSETS_FOLDER.mkdir())
                throw new IOException("Impossible de créer le dossier des assets du jeu.");
        } catch (Exception e) {
            throw new LauncherException(new String[] {
                    "Erreur lors de l'initialisation du launcheur.",
                    "Erreur: " + e.getMessage()
            });
        }
    }

    public String getUrlActualGameVersion() throws Exception {
        JsonElement jsonElement = Utils.getJsonResponseFromURL(VERSION_LIST);
        JsonObject json = jsonElement.getAsJsonObject();
        JsonArray jsonArray = json.get("versions").getAsJsonArray();
        String dataVersionURL = null;
        for (int i = 0; i < jsonArray.size(); ++i) {
            JsonObject jsonVersion = jsonArray.get(i).getAsJsonObject();
            String version = jsonVersion.get("id").getAsString();
            if (version.equals(this.gameVersion)) {
                dataVersionURL = jsonVersion.get("url").getAsString();
                break;
            }
        }
        if (dataVersionURL == null)
            throw new Exception("La version de jeu " + this.gameVersion + " n'existe pas.");
        return dataVersionURL;
    }

    public List<MojangFile> getGameLibsURL() throws LauncherException {
        List<MojangFile> libsURL = new ArrayList<>();

        try {
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.metaUrlGameVersion);
            JsonObject json = jsonElement.getAsJsonObject();
            JsonArray jsonLibs = json.get("libraries").getAsJsonArray();
            for (int i = 0; i < jsonLibs.size(); ++i) {
                JsonObject lib = jsonLibs.get(i).getAsJsonObject().get("downloads").getAsJsonObject().get("artifact").getAsJsonObject();
                libsURL.add(new MojangFile(
                        lib.get("url").getAsString(),
                        lib.get("size").getAsDouble()
                ));
            }
            return libsURL;
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement des librairies de Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public List<MojangFile> getAssetsUrl() throws LauncherException {
        List<MojangFile> libsURL = new ArrayList<>();

        try {
            String osName = "";
            switch (this.osType) {
                case WINDOWS:
                    osName = "natives-windows";
                    break;
                case LINUX:
                    osName = "natives-linux";
                    break;
                case MAC_OS:
                    osName = "natives-macos";
                    break;
            }
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.metaUrlGameVersion);
            JsonObject json = jsonElement.getAsJsonObject();
            JsonArray jsonLibs = json.get("libraries").getAsJsonArray();
            for (int i = 0; i < jsonLibs.size(); ++i) {
                JsonObject download = jsonLibs.get(i).getAsJsonObject().get("downloads").getAsJsonObject();
                if (download.get("classifiers") != null) {
                    JsonElement libElem = download.get("classifiers").getAsJsonObject().get(osName);
                    if (libElem != null) {
                        JsonObject lib = libElem.getAsJsonObject();
                        libsURL.add(new MojangFile(
                                lib.get("url").getAsString(),
                                lib.get("size").getAsDouble()
                        ));
                    }
                }
            }
            return libsURL;
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement des librairies de Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public String getMinecraftMainClass() throws LauncherException {
        try {
            JsonElement json = Utils.getJsonResponseFromURL(this.metaUrlGameVersion);
            return json.getAsJsonObject().get("mainClass").getAsString();
        } catch (Exception e) {
            throw new LauncherException(new String[] {
                    "Erreur lors de la récupération d'informations sur Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public MojangFile getClientUrl() throws LauncherException {
        try {
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.metaUrlGameVersion);
            JsonObject json = jsonElement.getAsJsonObject();
            JsonObject client = json.get("downloads").getAsJsonObject().get("client").getAsJsonObject();
            return new MojangFile(client.get("url").getAsString(), client.get("size").getAsDouble());
        } catch (Exception e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement du jeu Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public String getLauncherVersion() {
        return launcherVersion;
    }

    public String getGameVersion() {
        return gameVersion;
    }

    public OsType getOS() {
        return osType;
    }
}

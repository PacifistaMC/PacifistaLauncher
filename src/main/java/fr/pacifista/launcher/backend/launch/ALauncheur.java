package fr.pacifista.launcher.backend.launch;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import fr.pacifista.launcher.backend.MojangFile;
import fr.pacifista.launcher.utils.FileDownload;
import fr.pacifista.launcher.utils.LauncherException;
import fr.pacifista.launcher.utils.OsType;
import fr.pacifista.launcher.utils.Utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

public abstract class ALauncheur {

    public static final String VERSION_LIST = "https://launchermeta.mojang.com/mc/game/version_manifest.json";
    public static final String RESSOURCE_URL = "https://resources.download.minecraft.net";
    public static final File DATA_FOLDER = new File("." + File.separator + "data");

    private final File gameFolder;
    private final File gameLibsFolder;
    private final File gameAssetsFolder;

    private final String gameVersion;
    private final String metaUrlGameVersion;
    private final String assetsIndexVersion;
    private final OsType osType;

    ALauncheur(final String minecraftName, final String gameVersion) throws LauncherException {
        try {
            this.gameFolder = new File(DATA_FOLDER, minecraftName);
            this.gameLibsFolder = new File(this.gameFolder, "gameLibs");
            this.gameAssetsFolder = new File(this.gameFolder, "assets");
            final String osType = System.getProperty("os.name").toLowerCase();
            if (osType.contains("win"))
                this.osType = OsType.WINDOWS;
            else if (osType.contains("mac"))
                this.osType = OsType.MAC_OS;
            else if (osType.contains("nux"))
                this.osType = OsType.LINUX;
            else
                throw new IOException("Votre os n'est pas supporté pour jouer à Minecraft");

            this.gameVersion = gameVersion;
            this.metaUrlGameVersion = getUrlActualGameVersion();
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.metaUrlGameVersion);
            JsonObject assetIndex = jsonElement.getAsJsonObject().get("assetIndex").getAsJsonObject();
            this.assetsIndexVersion = assetIndex.get("id").getAsString();

            if (!this.gameFolder.exists() && !this.gameFolder.mkdir())
                throw new IOException("Impossible de créer le dossier .minecraft.");
            if (!this.gameLibsFolder.exists() && !this.gameLibsFolder.mkdir())
                throw new IOException("Impossible de créer le dossier des librairies du jeu.");
            if (!this.gameAssetsFolder.exists() && !this.gameAssetsFolder.mkdir())
                throw new IOException("Impossible de créer le dossier des assets du jeu.");
            File indexesAssets = new File(this.getGameAssetsFolder(), "indexes");
            File objectsAssets = new File(this.getGameAssetsFolder(), "objects");
            if (!indexesAssets.exists() && !indexesAssets.mkdir())
                throw new IOException("Impossible de créer le dossier des indexes des assets du jeu.");
            if (!objectsAssets.exists() && !objectsAssets.mkdir())
                throw new IOException("Impossible de créer le dossier des indexes des assets du jeu.");

        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Erreur lors de l'initialisation du launcheur.",
                    "Erreur: " + e.getMessage()
            });
        }
    }

    public List<FileDownload> downloadGameLibs() throws LauncherException {
        List<FileDownload> downloads = new ArrayList<>();

        try {
            String osName;
            switch (this.getOsType()) {
                case WINDOWS:
                    osName = "natives-windows";
                    break;
                case LINUX:
                    osName = "natives-linux";
                    break;
                case MAC_OS:
                    osName = "natives-osx";
                    break;
                default:
                    throw new LauncherException("Votre os ne peut pas lancer Minecraft");
            }

            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.getMetaUrlGameVersion());
            JsonObject json = jsonElement.getAsJsonObject();
            JsonArray jsonLibs = json.get("libraries").getAsJsonArray();
            for (int i = 0; i < jsonLibs.size(); ++i) {
                JsonObject elem = jsonLibs.get(i).getAsJsonObject();

                downloads.addAll(downloadClassifiers(elem, osName));
                downloads.addAll(donwloadGameLibs(elem));
            }
            return downloads;
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement des librairies de Minecraft.",
                    "Veuillez vérifier votre connexion."
            });
        }
    }

    public List<FileDownload> downloadAssetsFiles() throws LauncherException {
        List<FileDownload> dls = new ArrayList<>();
        File objectsFolder = new File(this.gameAssetsFolder, "objects");

        try {
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.getMetaUrlGameVersion());
            JsonObject json = jsonElement.getAsJsonObject();

            JsonObject assetIndex = json.get("assetIndex").getAsJsonObject();
            String urlAssets = assetIndex.get("url").getAsString();
            MojangFile assetJSONFile = new MojangFile(urlAssets, assetIndex.get("size").getAsLong());
            File indexes = new File(this.getGameAssetsFolder(), "indexes");
            File fileToStore = new File(indexes, assetJSONFile.getFileName());
            if (fileNeedUpdate(fileToStore, assetJSONFile.getFileSize()))
                dls.add(new FileDownload(assetJSONFile.getDownloadUrl(), fileToStore.getPath()));

            JsonObject assetsObjects = Utils.getJsonResponseFromURL(urlAssets).getAsJsonObject().get("objects").getAsJsonObject();
            Set<String> assetsObjectsEntry = assetsObjects.keySet();
            for (String asset : assetsObjectsEntry) {
                JsonObject assetObject = assetsObjects.get(asset).getAsJsonObject();
                String hash = assetObject.get("hash").getAsString();
                String subAsset = hash.substring(0, 2);
                long size = assetObject.get("size").getAsLong();
                String url = ALauncheur.RESSOURCE_URL + "/" + subAsset + "/" + hash;
                File obFolder = new File(objectsFolder, subAsset);
                if (!obFolder.exists() && !obFolder.mkdir())
                    throw new IOException("Impossible de créer un dossier d'asset");
                File assetFile = new File(obFolder, hash);
                if (fileNeedUpdate(assetFile, size))
                    dls.add(new FileDownload(url, assetFile.getPath()));
            }

            return dls;
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement des librairies de Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public String getMinecraftMainClass() throws LauncherException {
        try {
            JsonElement json = Utils.getJsonResponseFromURL(this.getMetaUrlGameVersion());
            return json.getAsJsonObject().get("mainClass").getAsString();
        } catch (Exception e) {
            throw new LauncherException(new String[] {
                    "Erreur lors de la récupération d'informations sur Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    public FileDownload downloadClient() throws LauncherException {
        try {
            JsonElement jsonElement = Utils.getJsonResponseFromURL(this.getMetaUrlGameVersion());
            JsonObject json = jsonElement.getAsJsonObject();
            JsonObject client = json.get("downloads").getAsJsonObject().get("client").getAsJsonObject();
            MojangFile clientUrl = new MojangFile(client.get("url").getAsString(), client.get("size").getAsLong());
            File clientFile = new File(this.getGameFolder(), clientUrl.getFileName());
            if (fileNeedUpdate(clientFile, clientUrl.getFileSize()))
                return new FileDownload(clientUrl.getDownloadUrl(), clientFile.getPath());
            else
                return null;
        } catch (Exception e) {
            throw new LauncherException(new String[] {
                    "Erreur lors du téléchargement du jeu Minecraft.",
                    "Message d'erreur: " + e.getMessage()
            });
        }
    }

    private List<FileDownload> downloadClassifiers(JsonObject elem, String osName) throws LauncherException {
        List<FileDownload> downloadsElems = new ArrayList<>();
        if (!checkLibRule(elem.get("rules"), true)) return Collections.emptyList();
        JsonObject libs = elem.get("downloads").getAsJsonObject();
        JsonElement libElem = libs.get("classifiers");
        if (libElem == null) return Collections.emptyList();
        JsonObject classifiers = libElem.getAsJsonObject();
        JsonElement classDL = classifiers.get(osName);
        if (classDL == null) return Collections.emptyList();
        JsonObject lib = classDL.getAsJsonObject();
        MojangFile mojangFile = new MojangFile(lib.get("url").getAsString(), lib.get("size").getAsLong());
        File libFile = new File(this.getGameLibsFolder(), mojangFile.getFileName());
        if (fileNeedUpdate(libFile, mojangFile.getFileSize()))
            downloadsElems.add(new FileDownload(mojangFile.getDownloadUrl(), libFile.getPath()));
        return downloadsElems;
    }

    private List<FileDownload> donwloadGameLibs(JsonObject elem) throws LauncherException {
        List<FileDownload> downloadsElems = new ArrayList<>();
        if (!checkLibRule(elem.get("rules"), false)) return Collections.emptyList();
        JsonObject libs = elem.get("downloads").getAsJsonObject();
        JsonElement artifactElem = libs.get("artifact");
        if (artifactElem == null) return Collections.emptyList();
        JsonObject artifact = artifactElem.getAsJsonObject();
        MojangFile mojangFile2 = new MojangFile(artifact.get("url").getAsString(), artifact.get("size").getAsLong());
        File artifactFile = new File(this.gameLibsFolder, mojangFile2.getFileName());
        if (fileNeedUpdate(artifactFile, mojangFile2.getFileSize()))
            downloadsElems.add(new FileDownload(mojangFile2.getDownloadUrl(), artifactFile.getPath()));
        return downloadsElems;
    }

    private String getUrlActualGameVersion() throws IOException {
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
            throw new IOException("La version de jeu " + this.gameVersion + " n'existe pas.");
        return dataVersionURL;
    }

    private boolean checkLibRule(JsonElement rulesElem, boolean check) {
        if (rulesElem == null) {
            if (check)
                return false;
            else
                return true;
        }
        JsonArray rules = rulesElem.getAsJsonArray();
        if (rules.size() > 1) {
            JsonObject rule0 = rules.get(0).getAsJsonObject();
            JsonObject rule1 = rules.get(1).getAsJsonObject();
            JsonObject os = rule1.get("os").getAsJsonObject();
            if (rule0.get("action").getAsString().equals("allow") &&
                    rule1.get("action").getAsString().equals("disallow") &&
                    os.get("name").getAsString().equals("osx"))
                return this.osType == OsType.MAC_OS;
            else
                return true;
        } else {
            JsonObject rule = rules.get(0).getAsJsonObject();
            String action = rule.get("action").getAsString();
            JsonElement os = rule.get("os");
            if (action.equals("allow") && os != null)
                return this.osType != OsType.MAC_OS;
        }
        return true;
    }

    private boolean fileNeedUpdate(File file, long fileSizeToCheck) throws LauncherException {
        if (file.exists()) {
            long fileSize = file.length();
            if (fileSize == fileSizeToCheck)
                return false;
            else {
                if (!file.delete())
                    throw new LauncherException(new String[] {"Impossible de supprimer un fichier: " + file.getName()});
                return true;
            }
        } else
            return true;
    }

    public File getGameAssetsFolder() {
        return gameAssetsFolder;
    }

    public File getGameFolder() {
        return gameFolder;
    }

    public File getGameLibsFolder() {
        return gameLibsFolder;
    }

    public String getGameVersion() {
        return gameVersion;
    }

    public OsType getOsType() {
        return osType;
    }

    public String getMetaUrlGameVersion() {
        return metaUrlGameVersion;
    }

    public String getAssetsIndexVersion() {
        return assetsIndexVersion;
    }
}

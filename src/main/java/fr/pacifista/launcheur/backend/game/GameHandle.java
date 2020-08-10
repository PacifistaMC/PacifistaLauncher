package fr.pacifista.launcheur.backend.game;

import fr.pacifista.launcheur.Main;
import fr.pacifista.launcheur.backend.Launcheur;
import fr.pacifista.launcheur.backend.MojangAuth;
import fr.pacifista.launcheur.backend.MojangFile;
import fr.pacifista.launcheur.utils.FileActions;
import fr.pacifista.launcheur.utils.FileDownload;
import fr.pacifista.launcheur.utils.LauncherException;
import fr.pacifista.launcheur.utils.OsType;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class GameHandle {

    public static GameJVM startGame(Main main) throws LauncherException {
        MojangAuth mojangAuth = main.getMojangAuth();

        downloadGameLibs(main);
        downloadAssets(main);
        downloadClient(main);
        String mainClass = main.getLauncheur().getMinecraftMainClass();

        List<String> vmArgs = Arrays.asList(
                "-Xms512M",
                "-Xmx1024M",
                "-Xss1M",
                "-Djava.library.path=" + Launcheur.GAME_ASSETS_FOLDER.getPath(),
                "-Dminecraft.launcher.brand=Pacifista"
        );
        List<String> gameArgs = Arrays.asList(
                "--username " + mojangAuth.getUserName(),
                "--version " + main.getLauncheur().getGameVersion(),
                "--gameDir ./data/gameDir/",
                "--assetsDir ./data/gameDir/assets",
                "--assetIndex " + main.getLauncheur().getGameVersion(),
                "--uuid " + main.getMojangAuth().getUserUUID(),
                "--accessToken " + main.getMojangAuth().getClientToken(),
                "--userType mojang"
        );
        String classPath = Launcheur.GAME_FODER.getPath() + File.separator + "client.jar" + (main.getLauncheur().getOS().equals(OsType.WINDOWS) ? ';' : ':') + Launcheur.GAME_LIB_FOLDER.getPath() + File.separator + "*";

        return new GameJVM(vmArgs, mainClass, gameArgs, classPath);
    }

    private static void downloadGameLibs(Main main) throws LauncherException {
        List<MojangFile> libsURL = main.getLauncheur().getGameLibsURL();

        for (MojangFile lib : libsURL) {
            File libFile = new File(Launcheur.GAME_LIB_FOLDER, lib.getFileName());
            if (libFile.exists()) {
                long fileSize = libFile.length();
                if (fileSize == lib.getFileSize())
                    continue;
                else {
                    if (!libFile.delete())
                        throw new LauncherException(new String[] {"Impossible de supprimer la lib Minecraft: " + lib.getFileName()});
                }
            }
            startDownload(lib, libFile.getPath());
        }
    }

    private static void downloadAssets(Main main) throws LauncherException {
        List<MojangFile> gameLibsUrl = main.getLauncheur().getAssetsUrl();

        try {
            for (MojangFile lib : gameLibsUrl) {
                File libFile = new File(Launcheur.GAME_ASSETS_FOLDER, lib.getFileName());
                if (libFile.exists()) {
                    long fileSize = libFile.length();
                    if (fileSize == lib.getFileSize())
                        continue;
                    else {
                        if (!libFile.delete())
                            throw new IOException();
                    }
                }
                startDownload(lib, libFile.getPath());
            }
            File[] assets = Launcheur.GAME_ASSETS_FOLDER.listFiles();
            if (assets == null)
                throw new IOException();
            for (File asset : assets) {
                FileActions.extractAllArchive(asset.getPath(), Launcheur.GAME_ASSETS_FOLDER);
            }
        } catch (IOException e) {
            throw new LauncherException(new String[]{"Une erreur est survenue lors de l'extraction des libs de jeu."});
        }
    }

    private static void downloadClient(Main main) throws LauncherException {
        MojangFile clientUrl = main.getLauncheur().getClientUrl();

        File clientFile = new File(Launcheur.GAME_FODER, clientUrl.getFileName());
        if (clientFile.exists()) {
            long fileSize = clientFile.length();
            if (fileSize == clientUrl.getFileSize())
                return;
            else {
                if (!clientFile.delete())
                    throw new LauncherException(new String[]{"Impossible de supprimer le client Minecraft: " + clientUrl.getFileName()});
            }
        }
        startDownload(clientUrl, clientFile.getPath());
    }

    private static void startDownload(final MojangFile mojangFile, final String pathDownload) {
        FileDownload fileDownload = new FileDownload(mojangFile.getDownloadUrl(), pathDownload);
        System.out.println("Started download of: " + mojangFile.getFileName());
        fileDownload.start();
        int progression = 0;
        while (!fileDownload.isDownloadDone() && fileDownload.isAlive() && !fileDownload.isInterrupted()) {
            if (fileDownload.getDownloadProgression() > progression) {
                progression = fileDownload.getDownloadProgression();
                System.out.println(progression + "%");
            }
        }
    }

}

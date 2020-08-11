package fr.pacifista.launcheur.backend.game;

import fr.pacifista.launcheur.Main;
import fr.pacifista.launcheur.backend.Launcheur;
import fr.pacifista.launcheur.backend.MojangAuth;
import fr.pacifista.launcheur.utils.*;

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
        String osFlag;
        switch (main.getLauncheur().getOS()) {
            case WINDOWS:
                osFlag = "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump";
                break;
            case LINUX:
                osFlag = "-Xss1M";
                break;
            case MAC_OS:
                osFlag = "-XstartOnFirstThread";
                break;
            default:
                return null;
        }

        List<String> vmArgs = Arrays.asList(
                "-Xms512M",
                "-Xmx1024M",
                osFlag,
                "-Djava.library.path=" + Launcheur.GAME_ASSETS_FOLDER.getPath(),
                "-Dminecraft.launcher.brand=Pacifista"
        );
        List<String> gameArgs = Arrays.asList(
                "--accessToken=" + main.getMojangAuth().getClientToken(),
                "--version=" + main.getLauncheur().getGameVersion(),
                "--username=" + mojangAuth.getUserName(),
                "--gameDir=" + Launcheur.GAME_FODER.getPath(),
                "--assetsDir=" + Launcheur.GAME_ASSETS_FOLDER.getPath(),
                "--assetIndex=" + main.getLauncheur().getAssetsIndexVersion(),
                "--uuid=" + main.getMojangAuth().getUserUUID(),
                "--userType=mojang"
        );
        String classPath = Launcheur.GAME_FODER.getPath() + File.separator + "client.jar" + (main.getLauncheur().getOS().equals(OsType.WINDOWS) ? ';' : ':') + Launcheur.GAME_LIB_FOLDER.getPath() + File.separator + "*";

        return new GameJVM(vmArgs, mainClass, gameArgs, classPath);
    }

    private static void downloadGameLibs(Main main) throws LauncherException {
        List<FileDownload> libsURL = main.getLauncheur().downloadGameLibs();

        for (FileDownload lib : libsURL)
            startDownload(lib);
    }

    private static void downloadAssets(Main main) throws LauncherException {
        List<FileDownload> gameAssets = main.getLauncheur().downloadAssetsFiles();

        try {
            for (FileDownload lib : gameAssets)
                startDownload(lib);
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
        FileDownload clientUrl = main.getLauncheur().downloadClient();
        startDownload(clientUrl);
    }

    private static void startDownload(final FileDownload fileDownload) {
        System.out.println("New DL");
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

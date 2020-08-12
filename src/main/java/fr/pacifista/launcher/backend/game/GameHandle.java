package fr.pacifista.launcher.backend.game;

import fr.pacifista.launcher.backend.launch.ALauncheur;
import fr.pacifista.launcher.backend.MojangAuth;
import fr.pacifista.launcher.utils.*;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class GameHandle {

    public static GameJVM startGame(final ALauncheur launcheur, final MojangAuth mojangAuth) throws LauncherException {
        downloadGameLibs(launcheur);
        downloadAssets(launcheur);
        downloadClient(launcheur);
        String mainClass = launcheur.getMinecraftMainClass();
        String osFlag;
        switch (launcheur.getOsType()) {
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
                throw new LauncherException(new String[] {"Une erreur est survenue lors du lancement du jeu.", "Votre OS n'est pas supporté."});
        }

        List<String> vmArgs = Arrays.asList(
                "-Xms512M",
                "-Xmx1024M",
                osFlag,
                "-Djava.library.path=" + launcheur.getGameFolder().getPath(),
                "-Dminecraft.launcher.brand=PacifistaLaucher"
        );
        List<String> gameArgs = Arrays.asList(
                "--accessToken=" + mojangAuth.getClientToken(),
                "--version=" + launcheur.getGameVersion(),
                "--username=" + mojangAuth.getUserName(),
                "--gameDir=" + launcheur.getGameFolder().getPath(),
                "--assetsDir=" + launcheur.getGameAssetsFolder().getPath(),
                "--assetIndex=" + launcheur.getAssetsIndexVersion(),
                "--uuid=" + mojangAuth.getUserUUID(),
                "--userType=mojang"
        );
        String classPath = launcheur.getGameFolder().getPath() + File.separator +
                "client.jar" + (launcheur.getOsType().equals(OsType.WINDOWS) ? ';' : ':') +
                launcheur.getGameLibsFolder().getPath() + File.separator + "*";

        return new GameJVM(vmArgs, mainClass, gameArgs, classPath);
    }

    private static void downloadGameLibs(ALauncheur launcheur) throws LauncherException {
        List<FileDownload> libsURL = launcheur.downloadGameLibs();

        for (FileDownload lib : libsURL)
            startDownload(lib);
    }

    private static void downloadAssets(ALauncheur launcheur) throws LauncherException {
        List<FileDownload> gameAssets = launcheur.downloadAssetsFiles();

        //try {
            for (FileDownload lib : gameAssets)
                startDownload(lib);
            /*File[] assets = launcheur.getGameAssetsFolder().listFiles();
            if (assets == null)
                throw new IOException();
            for (File asset : assets) {
                if (asset.getName().equals("indexes")) continue;
                FileActions.extractAllArchive(asset.getPath(), launcheur.getGameAssetsFolder());
            }
        } catch (IOException e) {
            throw new LauncherException(new String[] {
                    "Une erreur est survenue lors du téléchargements des fichiers du jeu."
            });
        }*/
    }

    private static void downloadClient(ALauncheur launcheur) throws LauncherException {
        FileDownload clientUrl = launcheur.downloadClient();
        if (clientUrl != null)
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

package fr.pacifista.launcher;

import fr.pacifista.launcher.backend.MojangAuth;
import fr.pacifista.launcher.backend.game.GameJVM;
import fr.pacifista.launcher.backend.launchers.ALauncheur;

import java.io.IOException;
import java.util.Properties;

public class Main {

    private final String launcherVersion;
    private final MojangAuth mojangAuth;
    private GameJVM gameJVM = null;

    private Main(String[] args) throws LauncherException {
        if (!ALauncheur.DATA_FOLDER.exists() && !ALauncheur.DATA_FOLDER.mkdir())
            throw new LauncherException("Impossible de créer le dossier data. Veuillez vérifier que le launcheur ait la permission de créer des dossiers / fichiers.", "No permission to create folder");

        final Properties properties = new Properties();
        try {
            properties.load(this.getClass().getClassLoader().getResourceAsStream("launcheur.properties"));
        } catch (IOException ioException) {
            throw new LauncherException("Une erreur interne est survenue.", ioException.getMessage());
        }
        this.launcherVersion = properties.getProperty("launcherVersion");

        try {
            this.mojangAuth = new MojangAuth();
        } catch (IOException e) {
            //TODO Need credentials
            throw new LauncherException("User not logged", e.getMessage());
        }
    }

    public MojangAuth getMojangAuth() {
        return mojangAuth;
    }

    public static void main(String[] args) {
        try {
            Main instance = new Main(args);
            //instance.gameJVM = GameHandle.startGame(instance.getLauncheur("pacifista"), instance.getMojangAuth());
        } catch (Exception e) {
            if (e instanceof LauncherException) {
                LauncherException launcherException = (LauncherException) e;
                e.printStackTrace();
                return;
            }
            e.printStackTrace();
        }
    }
}

package fr.pacifista.launcher;

import fr.pacifista.launcher.backend.launch.Pacifista;
import fr.pacifista.launcher.backend.MojangAuth;
import fr.pacifista.launcher.backend.game.GameHandle;
import fr.pacifista.launcher.backend.game.GameJVM;
import fr.pacifista.launcher.backend.launch.ALauncheur;
import fr.pacifista.launcher.utils.LauncherException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

public class Main {

    private final String launcherVersion;
    private final List<ALauncheur> launcheurs;
    private MojangAuth mojangAuth;
    private GameJVM gameJVM = null;

    private Main(String[] args) throws LauncherException, IOException {
        if (!ALauncheur.DATA_FOLDER.exists() && !ALauncheur.DATA_FOLDER.mkdir())
            throw new IOException("Impossible de créer le dossier data.");
        final Properties properties = new Properties();
        properties.load(this.getClass().getClassLoader().getResourceAsStream("launcheur.properties"));
        this.launcherVersion = properties.getProperty("launcherVersion");

        this.mojangAuth = MojangAuth.login();
        if (this.mojangAuth == null && args.length == 2)
            this.mojangAuth = MojangAuth.login(args[0], args[1]);
        if (!this.mojangAuth.validate() && args.length == 2)
            this.mojangAuth = MojangAuth.login(args[0], args[1]);

        this.launcheurs = Arrays.asList(
                new Pacifista()
        );
    }

    public ALauncheur getLauncheur(final String type) {
        if (type.equalsIgnoreCase("pacifista"))
            return launcheurs.get(0);
        else
            return null;
    }

    public MojangAuth getMojangAuth() {
        return mojangAuth;
    }

    public static void main(String[] args) {
        try {
            Main instance = new Main(args);
            instance.gameJVM = GameHandle.startGame(instance.getLauncheur("pacifista"), instance.getMojangAuth());
        } catch (Exception e) {
            if (e instanceof LauncherException) {
                LauncherException launcherException = (LauncherException) e;
                System.err.println(Arrays.toString(launcherException.getErrorMessages()));
            }
            e.printStackTrace();
        }
    }
}

package fr.pacifista.launcheur;

import fr.pacifista.launcheur.backend.Launcheur;
import fr.pacifista.launcheur.backend.MojangAuth;
import fr.pacifista.launcheur.backend.game.GameHandle;
import fr.pacifista.launcheur.backend.game.GameJVM;
import fr.pacifista.launcheur.utils.LauncherException;

import java.io.IOException;
import java.util.Arrays;

public class Main {

    private final Launcheur launcheur;
    private MojangAuth mojangAuth;
    private GameJVM gameJVM;

    private Main(String[] args) throws LauncherException, IOException {
        if (!Launcheur.DATA_FOLDER.exists() && !Launcheur.DATA_FOLDER.mkdir())
            throw new IOException("Impossible de créer le dossier data.");
        this.gameJVM = null;
        this.mojangAuth = MojangAuth.login();
        if (this.mojangAuth == null && args.length == 2)
            this.mojangAuth = MojangAuth.login(args[0], args[1]);
        this.launcheur = new Launcheur(this);
    }

    public Launcheur getLauncheur() {
        return launcheur;
    }

    public MojangAuth getMojangAuth() {
        return mojangAuth;
    }

    public static void main(String[] args) {
        try {
            Main instance = new Main(args);
            instance.gameJVM = GameHandle.startGame(instance);
        } catch (Exception e) {
            if (e instanceof LauncherException) {
                LauncherException launcherException = (LauncherException) e;
                System.err.println(Arrays.toString(launcherException.getErrorMessages()));
            }
            e.printStackTrace();
        }
    }
}

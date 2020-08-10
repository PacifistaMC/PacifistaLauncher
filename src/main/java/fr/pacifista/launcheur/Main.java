package fr.pacifista.launcheur;

import fr.pacifista.launcheur.backend.Launcheur;
import fr.pacifista.launcheur.backend.MojangAuth;
import fr.pacifista.launcheur.backend.game.GameHandle;
import fr.pacifista.launcheur.backend.game.GameJVM;
import fr.pacifista.launcheur.utils.LauncherException;

import java.io.IOException;
import java.util.Arrays;

public class Main {

    private static Main instance;

    private final Launcheur launcheur;
    private MojangAuth mojangAuth;
    private GameJVM gameJVM;

    private Main() throws LauncherException, IOException {
        this.gameJVM = null;
        this.mojangAuth = MojangAuth.login();
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
            instance = new Main();
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

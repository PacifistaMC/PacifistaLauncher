package fr.pacifista.launcher.backend.launchers;

import fr.pacifista.launcher.LauncherException;

public class Launchers {

    private static volatile Launchers instance = null;

    private final PacifistaLauncher pacifistaLauncher;

    private Launchers() throws LauncherException {
        this.pacifistaLauncher = new PacifistaLauncher();
    }

    private static Launchers getInstance() throws LauncherException {
        if (instance == null)
            instance = new Launchers();
        return instance;
    }

    public static PacifistaLauncher getPacifistaLauncher() throws LauncherException {
        return getInstance().pacifistaLauncher;
    }
}

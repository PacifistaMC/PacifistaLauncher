package fr.pacifista.launcher.backend.launchers;

import fr.pacifista.launcher.LauncherException;

public class PacifistaLauncher extends ALauncheur {

    protected PacifistaLauncher() throws LauncherException {
        super(".pacifista", "1.16.1");
    }
}

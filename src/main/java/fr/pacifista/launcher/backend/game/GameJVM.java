package fr.pacifista.launcher.backend.game;

import fr.pacifista.launcher.LauncherException;
import fr.pacifista.launcher.utils.StreamGobbler;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GameJVM {

    private final Process gameJVM;

    GameJVM(final List<String> vmArgs, final String mainClassGame, final List<String> launchGameArgs, String classpath) throws LauncherException {
        try {
            String jvm = System.getProperty("java.home") + File.separator + "bin" + File.separator + "java";
            List<String> command = new ArrayList<>();

            command.add(jvm);
            command.addAll(vmArgs);
            command.add(mainClassGame);
            command.addAll(launchGameArgs);

            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.environment().put("CLASSPATH", classpath);
            this.gameJVM = processBuilder.start();
            StreamGobbler errOut = new StreamGobbler(this.gameJVM.getErrorStream(), "MinecraftLog - Error", System.err);
            StreamGobbler normalOut  = new StreamGobbler(this.gameJVM.getInputStream(), "MinecraftLog - Info", System.out);
            errOut.start();
            normalOut.start();
        } catch (IOException e) {
            throw new LauncherException("Une erreur est survenue lors du lancement de Minecraft. Veuillez relancer le jeu.", e.getMessage());
        }
    }

    public boolean isRunning() {
        return this.gameJVM.isAlive();
    }

    public void kill() {
        this.gameJVM.destroy();
    }

    public Process getVM() {
        return this.gameJVM;
    }

}

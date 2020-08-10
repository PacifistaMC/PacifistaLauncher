package fr.pacifista.launcheur.utils;

public class LauncherException extends Exception {

    private final String[] errorMessages;

    public LauncherException(String[] errorMessages) {
        this.errorMessages = errorMessages;
    }

    @Override
    public Throwable getCause() {
        return new Throwable(errorMessages[0]);
    }

    public String[] getErrorMessages() {
        return errorMessages;
    }
}

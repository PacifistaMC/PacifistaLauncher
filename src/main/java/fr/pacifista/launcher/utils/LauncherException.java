package fr.pacifista.launcher.utils;

public class LauncherException extends Exception {

    private final String[] errorMessages;

    public LauncherException(String[] errorMessages) {
        this.errorMessages = errorMessages;
    }

    public LauncherException(String errorMessage) {
        this.errorMessages = new String[]{errorMessage};
    }

    @Override
    public Throwable getCause() {
        return new Throwable(errorMessages[0]);
    }

    public String[] getErrorMessages() {
        return errorMessages;
    }
}

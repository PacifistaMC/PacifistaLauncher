package fr.pacifista.launcher;

public class LauncherException extends Exception {

    private final String publicMessage;
    private final String errorMessage;

    public LauncherException(final String publicErrorMessage, final String errorMessage) {
        super(publicErrorMessage);

        this.publicMessage = publicErrorMessage;
        this.errorMessage = errorMessage;
    }

    @Override
    public void printStackTrace() {
        super.printStackTrace();
    }

    @Override
    public String getMessage() {
        return errorMessage;
    }

    public String getPublicMessage() {
        return publicMessage;
    }
}

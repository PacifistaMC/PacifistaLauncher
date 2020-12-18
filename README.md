[![Build Actions Status](https://github.com/FunixG/PacifistaLauncher/workflows/maven-package/badge.svg)](https://github.com/FunixG/PacifistaLauncher/actions)

# PacifistaLauncheur
Voici le launcheur officiel de Pacifista (play.pacifista.fr)

## Installation
Installez [Java](https://www.java.com/fr/download/) pour utiliser le launcheur

Installez [Maven](https://maven.apache.org/install.html) pour compiler les sources et créer un executable

Une fois toutes les dépendances installées allez dans le dossier du projet et entrez
```bash
mvn package
```

Un dossier target sera donc crée avec nos executables.

Si vous êtes sur windows vous pouvez lancer le .exe sinon lancez le fichier java avec dépendances

## Lancement du launcheur

```bash
PacifistaLauncheur.exe [email mojang] [mot de passe]
```

Si vos identifiants sont corercts vous pouvez relancer le launcheur plus tard sans arguments, il aura enrengistré votre clé de compte

```bash
PacifistaLauncheur.exe
```

## Contribution

Les demandes de pull requests sont les bienvenues. Pour les changements majeurs, veuillez d'abord ouvrir une issue pour discuter de ce que vous souhaitez changer.

Veuillez vous assurer de mettre à jour les tests le cas échéant.

## Liens
[Site web](https://pacifista.fr)

[Créateur](https://twitter.com/funixgaming)

## License
[MIT](https://choosealicense.com/licenses/mit/)

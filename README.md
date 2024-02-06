# Project README

## Development host dependencies

-   [`direnv`](https://direnv.net/)
-   [`jq`](https://jqlang.github.io/jq/)
-   `docker` or Docker for Desktop
-   _(optional) a proper configured ZSH shell for better DX_
-   _(optional) `sed` or `gsed` (Macos)_

## Project Layout

```text
.
|- .github                  # GitHub definition
|- .gitlab                  # @obsolete GitLab issue templates
|- .husky                   # git hooks
|- bin
|  |- just                  # Project CLI for orchestrating Tech Stack
|  |- j                     # *just* an alias for `just`
|  [...]
[...]
|- src                      # Subproject source code locations
|  |- .environment          # tooling for working with .env files
|  |- .root                 # tooling for code quality tools for root files & cicd
|  |- api                   # e.g. API, Admin interface, ...
|  |- api-spec              # OpenAPI specification
|  |- langchain
|  |- langchain-notebooks
|  [...]
|- .envrc                   # `direnv` control script
|- .eslintrc.js             # `eslint` hints for `js`, `ts`, `md`, `json`, `vue`, `yaml`
|- .nvmrc                   # required node version definition used by `nvm`
|- .prettierrc.json         # `prettier` code style definition
|- package.json             # node based dependencies for root project
|- .env.encryption-key      # credentials to decrypt the environment settings
|- .env.digitalocean-token  # DigitalOcean token for usage with `bin/doctl` - optional
[...]
```

## Setup

### Precondition

1. Ensure Development host dependencies are present
2. Create `.env.encryption-key` and add credentials from <https://vault.bitwarden.com/#/vault?organizationId=9f987826-bc38-47ad-ae73-aec7013147b1&itemId=33194622-0abd-45e3-a88e-b06d00d4feac&cipherId=33194622-0abd-45e3-a88e-b06d00d4feac>

    ```dotenv
    ENVIRONMENT_ENCRYPTION_KEY=[get_key_from_bitwarden]
    ```

3. Run `direnv allow` to load `$ENVIRONMENT_ENCRYPTION_KEY` into environment
4. Get a github oauth token and store it in `src/api/auth.json` to don't
   get punished by GitHub rate limits

    1. see: [github-oauth](https://getcomposer.org/doc/articles/authentication-for-private-packages.md#github-oauth)
    2. get token: <https://github.com/settings/tokens/new>
    3. store token in `src/api/auth.json`

    ```json
    {
        "github-oauth": {
            "github.com": "token"
        }
    }
    ```

5. Run `just setup` and follow the CLI instructions

    ```shell
    just setup
    ```

    1. ⚠️ - The usual cycle of setting up a **new project** looks like:

        1. _optional_ `rm .env && direnv allow` _to ensure the .env is up-to-date,
           it gets recreated through step 2._
        2. ensure `.env.encryption-key` is defined & _optional a
           `.env.digitalocean-token` is also in place_
        3. `just setup` _// ensures `.env.local` is present and distributed
           as `.env`_
        4. `direnv allow` _// loads new `.env`_
        5. `just setup` _// installs all code dependencies and starts services_
        6. `just up` _// ensures all services are running_

    2. ⚠️ - Run `just ps` to check that the complete stack is running. It should look like the
       following output:

        ```text
        ++ UFOstart Product CLI ++ (local)

        SERVICE          PORTS                                                   STATUS
        api              0.0.0.0:80->80/tcp, [...]                               Up [...]
        api-node         0.0.0.0:5173->5173/tcp, [...]                           Up [...]
        api-queue        80/tcp                                                  Up [...]
        api-websockets   0.0.0.0:6001->6001/tcp, [...]                           Up [...]
        mailpit          0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp, [...]   Up [...]
        minio            0.0.0.0:8900->8900/tcp, 0.0.0.0:9000->9000/tcp, [...]   Up [...] (healthy)
        mysql            0.0.0.0:3306->3306/tcp, [...]                           Up [...] (healthy)
        ```

## `just|j` CLI Usage

```shell
just|j [command|subproject] [command]
```

1. Run `just` or it's alias `j` to list all command modules
2. API sub-project `just api` | `j a`

    1. ⚠️ `just help` prints an up-to-date help menu
    2. `just up|start` starts the whole stack in the background
    3. `just down|stop` stops the whole stack
    4. `just restart` restart service containers
    5. `just ps` list running services
    6. `just setup` installs all dependencies

## Working with the local development stack

1. Ensure the _local_ `.env` and the main dependencies are up-to-date `just setup`
2. Start the stack `just up` which starts the following services as daemons:

    - api
    - api-node
    - api-queue
    - api-websockets
    - mailpit
    - minio (S3)
    - mysql

3. For using the langchain based tools run

    - `just up langchain`
    - `just up langchain-notebooks`

## Working with `.env` files

Unpack changes to encrypted `.env` files to your environment using:

-   `just env decrypt:all`
-   `just env activate local`
-   `direnv allow`

Make changes to `.env.local` or other files and publish changes using:

-   `just env encrypt:all`
-   Inform other contributors in your PR by tagging them in the comments

### Provide local setup with `.env.custom`

#### What role does the `.env.custom` play?

-   It allows the customization of the local environment without changing the project's main
    configuration.
-   `direnv` applies its variables as last, so it overrides settings from other `.env.*` files.

#### Benefits of Using `.env.custom`

-   **Consistency**: Avoids altering standard project settings in `.env.*` files,
    keeping environments consistent.
-   **Personalization**: Allows you to adjust settings for your own needs
    (like choosing between `colima` and `docker for desktop`) without impacting others.

#### How to Set Up `.env.custom`

1. **Start with a Template**: Check the `.env.custom.template` for a structured example and
   additional options.
2. **Create Your File**: Copy the template into a new file named `.env.custom`.
3. **Customize**: Change the `.env.custom` with your specific settings. It will override settings
   from other `.env.*` files.

## Setting up XDEBUG in PHPStorm

1. Copy `.env.xdebug.template` to `.env.xdebug`
   _(The default configuration works for [Docker Desktop](https://www.docker.com/products/docker-desktop/))_.
2. Customize settings in your `.env.xdebug` if necessary.
3. Reload environment with `direnv allow`
4. Restart the api container `just up api`.

## Troubleshooting

1. XDebug is not working - ensure Port 9003 is **not** in use by any other application besides
   phpstorm on your machine by using:

    ```bash
    sudo lsof -i -n -P | grep TCP | grep 9003
    phpstorm  26162            user  466u  IPv6 0x6870ea788cc4736b      0t0    TCP *:9003 (LISTEN)
    ```

2. Receiving the `Error response from daemon: network [...] not found` when
   running `just up` then run the following command once

    ```shell
    just up --force-recreate
    ```

3. Frontend isn't hot reloading on file change

    > _We rely on Docker for Mac and Colima distributing inotify events to
    > the containers so that hot reload services are able to pick these up._

    Try to use polling instead of inotify events by adding `VITE_USE_POLLING=true` to `.env.custom`

    _For more details visit: [UFO-131](https://linear.app/ufostart/issue/UFO-131/make-usepolling-in-vite-configurable-to-address-100percent-cpu-usage)_

## Annotations

🚨 git hook `pre-push` are in place so watch out when you can't push you potentially
violate some conventions

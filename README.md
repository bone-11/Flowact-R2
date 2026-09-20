# FlowAct-R2 Project Clean Export

This bundle contains all four deployable project pages:

- `index.html`
- `index1.html`
- `index_blog.html`
- `index_bytedance_blog.html`

Only local files referenced by those pages are included. It excludes unused
videos, backups, prior download archives, Git metadata, and debug caches.

## Run

```sh
python3 serve.py --bind 127.0.0.1 --port 8123 --directory .
```

Open `http://127.0.0.1:8123/index.html`. The included server supports HTTP
Range requests required by the native video seek controls.

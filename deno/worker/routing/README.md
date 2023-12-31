
# Wrapper to unify cloudflare and deno workers

Cloudflare and deno-deploy are both v good worker deployment providers

Pros and cons to both, so I use both, but switching logic is annoying.

To handle serving workers/servers from either deno deploy or cloudflare workers, the modules here wrap each platforms idiosyncracies so that you can just define request/websocket handlers. 


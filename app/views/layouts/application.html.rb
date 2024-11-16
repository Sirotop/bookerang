<!DOCTYPE html>
<html>
  <head>
    <title>Bookerang</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <link rel="manifest" href="/manifest.json">
  </head>
  <body>
    <%= yield %>
  </body>
</html>
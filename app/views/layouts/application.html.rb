<!DOCTYPE html>
<html>
  <head>
    <title>Bookerang</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
    <meta name="theme-color" content="#B85042">

    <link rel="stylesheet" href="assets/application-8b441ae0.css">
    <script src="assets/application-d8a8613a.js" defer></script>
  </head>
  <body>
    <%= yield %>

    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('service-worker.js');
        });
      }
    </script>
  </body>
</html>
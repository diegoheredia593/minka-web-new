# Minka Web

Landing web para Minka, plataforma de administracion y experiencia comunitaria.

## HubSpot

El formulario de demo envia solicitudes a una ruta interna del sitio. Si existe
`HUBSPOT_PRIVATE_APP_TOKEN` o `HUBSPOT_ACCESS_TOKEN` como variable segura del
hosting, tambien crea el contacto, el deal y el pipeline `Minka - Ventas` en
HubSpot. Sin ese token, mantiene el envio actual a HubSpot Forms.

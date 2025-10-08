# Configuración paso a paso de los nodos  
**Flujo:** *Exportar Backlog desde Frontend (Webhook → CSV → SendGrid)*

A continuación se describe la configuración de cada nodo dentro del flujo utilizado para recibir un backlog de tareas, convertirlo a CSV y enviarlo por correo mediante SendGrid.

---

## Diagrama general del flujo

```
[Frontend] → [NestJS API] → [N8N Webhook] → [Data Extraction] → [CSV Generation] → [Email Delivery] → [User Notification]
```

---

## 1. Webhook

**Tipo de nodo:** Webhook  
**Propósito:** Recibir datos del frontend.  

**Configuración:**
- **HTTP Method:** `POST`
- **Path:** `/export-backlog`
- **Authentication:** `Basic Auth`
- **Respond:** `Immediately` (para no dejar esperando al cliente).
- **Body esperado:**
  ```json
  {
    "email": "usuario@dominio.com",
    "tasks": [
      {
        "_id": "123",
        "title": "Tarea de ejemplo",
        "description": "Descripción de prueba",
        "columnId": "Por hacer",
        "createdAt": "2025-10-07T12:00:00Z"
      }
    ]
  }
  ```

El campo `email` se usa como destinatario dinámico del correo final, y el arreglo `tasks` contiene las tareas a procesar.

---

## 2. Split Out

**Tipo de nodo:** Split Out  
**Propósito:** Dividir el arreglo de tareas recibido por el webhook.  

**Configuración:**
- **Field to Split Out:** `tasks`  
  (Esto crea un item separado por cada tarea dentro del flujo, facilitando su procesamiento individual).

---

## 3. Edit Fields

**Tipo de nodo:** Set  
**Propósito:** Estandarizar los campos y definir las columnas que se incluirán en el CSV.  

**Configuración:**
Cada campo define un nombre legible y toma el valor correspondiente del objeto de tarea:

| Nombre de campo | Valor asignado | Descripción |
|------------------|----------------|--------------|
| `ID` | `={{ $json["_id"] }}` | Identificador único de la tarea |
| `Título` | `={{ $json["title"] }}` | Título de la tarea |
| `Descripción` | `={{ $json["description"] }}` | Texto descriptivo |
| `Columna` | `={{ $json["columnId"] }}` | Columna actual en el tablero Kanban |
| `Creado` | `={{ new Date($json["createdAt"]).toLocaleString() }}` | Fecha de creación formateada |

> Este nodo genera una estructura limpia de datos que luego se convertirá en CSV.

---

## 4. Convert to File

**Tipo de nodo:** Convert to File  
**Propósito:** Transformar la lista de items en un archivo CSV descargable.  

**Configuración:**
- **Formato de salida:** CSV  
- **Delimitador:** `,`
- **Header Row:** `true` (agrega fila de encabezados).
- **Nombre dinámico del archivo:**  
  ```js
  backlog-${new Date().toISOString().slice(0, 10)}.csv
  ```
  Esto crea nombres como `backlog-2025-10-07.csv`.

> El archivo generado se almacena como un binario con propiedad `file`, que luego se usará como adjunto.

---

## 5. Merge

**Tipo de nodo:** Merge  
**Propósito:** Combinar el archivo CSV con los datos originales del webhook para poder acceder tanto al binario (`file`) como al correo de destino (`email`).  

**Configuración:**
- **Mode:** Merge by Position  
- Entrada principal (`Input 1`): salida del nodo *Convert to File*.  
- Entrada secundaria (`Input 2`): salida directa del *Webhook*.

> Este paso garantiza que el archivo CSV y el campo `email` estén disponibles en el mismo contexto antes de enviar el correo.

---

## 6. Send an Email (SendGrid)

**Tipo de nodo:** Send Email  
**Proveedor:** SendGrid  
**Propósito:** Enviar el CSV generado como adjunto.  

**Configuración:**
- **Service:** SendGrid
- **From Email:** `elianrhbn@gmail.com` (o variable `${SENDGRID_FROM}`)
- **To Email:** `={{ $('Webhook').item.json.body.email }}`
- **Subject:** `Backlog Kanban CSV`
- **Content:**  
  ```
  Here is your CSV of Kanban
  ```
- **Attachments:**
  - **Binary Property:** `file`  
    (Debe coincidir con el nombre del binario creado en *Convert to File*).

**Credenciales necesarias:**
- `SendGrid API Key`  
  (guardada como credencial en n8n o variable de entorno).

---

## Flujo de ejecución

1. El frontend envía una petición `POST` al webhook con `email` y `tasks`.
2. El Webhook pasa los datos al *Split Out*, que separa cada tarea.
3. *Edit Fields* define las columnas que irán al CSV.
4. *Convert to File* genera el archivo CSV con todas las tareas.
5. *Merge* une el archivo con el email original.
6. *Send an Email* usa SendGrid para enviar el CSV como adjunto.

---

## Resultado final

- El destinatario recibe un correo con el asunto **“Backlog Kanban CSV”**.  
- El correo contiene un archivo adjunto con nombre `backlog-YYYY-MM-DD.csv`.  
- Cada fila del CSV representa una tarea con sus datos principales.

---

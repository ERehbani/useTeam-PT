
# Prueba técnica useTeam

# Backend

- `.env`
```
    MONGODB_URI=mongodb://localhost:27017/kanban-board
    
    JWT_SECRET=useTeamPT
    
    PORT=3001
```

- `Comandos`
    ```
     npm i
     npm run start:dev
    ```

 

# Frontend

- `.env`
```
    N8N_WEBHOOK_URL=https://lihtronx.app.n8n.cloud/webhook/export-backlog
    N8N_BASIC_USER=exporter
    N8N_BASIC_PASS=token
    NEXT_PUBLIC_API_BACKEND=http://localhost:3001
```

- `Comandos`
    ```
     npm i
     npm run dev
    ```

 

# Sistema de Medicamentos para Idosos e Pessoas com Doenças Crônicas

Sistema de auxílio para monitoramento de administração de medicamentos

## Configuração das variáveis de ambiente

Crie um arquivo na pasta raiz do projeto chamado `.env`. Em seguida, copie as variáveis a seguir:

```
LOCALHOST=endereco-ou-nome-do-servidor
USER=seu-usuário
PASSWORD=senha-do-usuário
DATABASE=nome-do-banco-de-dados
```

> OBSERVAÇÃO: os valores para LOCALHOST, USER, PASSWORD E DATABASE devem ser substituídos pela configuração do banco de dados que usa o SGBD MySQL

# Executando o projeto
Basta executar o sistema usando o comando a seguir no Terminal:
```bash
node app.js
```

# Baixando dependências
````bash
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

# Estrutra packagejson
```bash
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

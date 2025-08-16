const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`🚀 Servidor HiraKata ejecutándose en http://localhost:${port}`);
    console.log(`📁 Sirviendo archivos desde: ${process.cwd()}`);
    console.log('🌍 CORS habilitado para testing de internacionalización');
});

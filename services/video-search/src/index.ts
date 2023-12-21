//Note: Sample http proxy as api-gateway for demo purpose (only)
import config from './config.js';
import app from './app.js';
import log from './log.js';

app.set('port', config.app.PORT);

app.listen(config.app.PORT, async () => {
  log.info(`Server is running at http://localhost:${app.get('port')}`, {
    location: 'index',
  });
});

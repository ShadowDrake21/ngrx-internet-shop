// angular stuff
import { bootstrapApplication } from '@angular/platform-browser';

// config
import { appConfig } from './app/app.config';

// components
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);

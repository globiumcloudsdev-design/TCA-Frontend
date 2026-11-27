// Registers the '@/' -> 'src/' alias so unit tests can import app modules directly.
import { register } from 'node:module';
register('./alias-loader.mjs', import.meta.url);

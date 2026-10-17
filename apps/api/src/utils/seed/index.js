import "dotenv/config";
import { seedAdmins } from "./admin.seed.js";
import { seedMaterials } from "./materials.seed.js";
import { seedServices } from "./services.seed.js";
import { seedVenues } from "./venues.seed.js";
import { seedProjects } from "./projects.seed.js";
import { seedTestimonials } from "./testimonials.seed.js";
import { seedStudioTemplates } from "./templates.seed.js";

export async function runAllSeeds() {
  await seedAdmins();
  await seedMaterials();
  await seedServices();
  await seedVenues();
  await seedProjects();
  await seedTestimonials();
  await seedStudioTemplates();
}

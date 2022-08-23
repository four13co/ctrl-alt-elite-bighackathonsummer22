import { Agenda, Job } from 'agenda/dist';

export default function (agenda: Agenda) {
  agenda.define('acumatica-sales-order-update', async (job: Job) => {});
}

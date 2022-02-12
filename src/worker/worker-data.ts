import { workerData as data } from 'worker_threads';
import { WorkerData } from '../types';

export const workerData: WorkerData = data as WorkerData;

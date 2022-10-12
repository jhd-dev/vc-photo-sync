import * as readline from 'readline-sync';
import { DeviceCodeInfo } from '@azure/identity';
import { Message, User } from '@microsoft/microsoft-graph-types';
import settings, { AppSettings } from './app-settings';
import * as graphHelper from './graph-helper';

async function main() {
    console.log('TypeScript Graph Tutorial');

    let choice = 0;

    // Initialize Graph
    initializeGraph(settings);

    // Greet the user by name
    await greetUserAsync();

    const choices = [
        'Display access token',
        'List my inbox',
        'Send mail',
        'List users (requires app-only)',
        'Make a Graph call',
    ];

    while (choice != -1) {
        choice = readline.keyInSelect(choices, 'Select an option', {
            cancel: 'Exit',
        });

        switch (choice) {
            case -1:
                // Exit
                console.log('Goodbye...');
                break;
            case 0:
                // Display access token
                await displayAccessTokenAsync();
                break;
            case 1:
                // List emails from user's inbox
                await listInboxAsync();
                break;
            case 2:
                // Send an email message
                await sendMailAsync();
                break;
            case 3:
                // List users
                await listUsersAsync();
                break;
            case 4:
                // Run any Graph code
                await makeGraphCallAsync();
                break;
            default:
                console.log('Invalid choice! Please try again.');
        }
    }
}

function initializeGraph(settings: AppSettings) {
    // TODO
}

async function greetUserAsync() {
    // TODO
}

async function displayAccessTokenAsync() {
    // TODO
}

async function listInboxAsync() {
    // TODO
}

async function sendMailAsync() {
    // TODO
}

async function listUsersAsync() {
    // TODO
}

async function makeGraphCallAsync() {
    // TODO
}

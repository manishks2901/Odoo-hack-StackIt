# Real-Time Notifications Setup with Pusher

## Pusher Configuration

To enable real-time notifications, you need to set up a Pusher account and configure the environment variables.

### 1. Create a Pusher Account

1. Go to [pusher.com](https://pusher.com/) and create a free account
2. Create a new app in your Pusher dashboard
3. Choose the following settings:
   - **Name**: Your app name (e.g., "StackIt Notifications")
   - **Cluster**: Choose the closest one to your users (e.g., `mt1` for US East)
   - **Tech Stack**: Web > JavaScript

### 2. Get Your Pusher Credentials

From your Pusher app dashboard, go to the "App Keys" tab and copy:
- App ID
- Key
- Secret
- Cluster

### 3. Update Environment Variables

Replace the placeholder values in your `.env` file:

```env
# Pusher Configuration
PUSHER_APP_ID="your-actual-pusher-app-id"
PUSHER_SECRET="your-actual-pusher-secret"
NEXT_PUBLIC_PUSHER_KEY="your-actual-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster-region"
```

### 4. Features Enabled

Once configured, users will receive real-time notifications for:

- **New Answers**: When someone answers their question
- **New Replies**: When someone replies to their answer or question
- **Vote Notifications**: When someone upvotes or downvotes their content

### 5. Notification Channels

- **Toast Notifications**: Immediate popup notifications using Sonner
- **Notification Bell**: Badge counter in the navbar showing unread count
- **Notification History**: Dropdown showing recent notifications with read/unread status

### 6. Testing

1. Sign in with two different accounts
2. Have one user ask a question
3. Have the other user answer the question
4. The question owner should receive a real-time notification

### 7. Pusher Dashboard

You can monitor real-time events in your Pusher dashboard under the "Debug Console" tab.

## Implementation Details

- Uses Pusher Channels for real-time WebSocket connections
- Server-side triggers notifications via Pusher API
- Client-side subscribes to user-specific channels
- Notifications are user-specific and secure
- No sensitive data is sent through Pusher channels

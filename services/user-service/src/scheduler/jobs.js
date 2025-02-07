const jobs = (userService) => [
    {
        name: 'dailyExpiredBlacklistedTokenCleanup',
        schedule: '0 5 * * *',
        task: async () => {
            try {
                console.log('Removing expired blacklisted tokens');
                userService.deleteExpiredBlacklistedTokensAsync();
            } catch (error) {
                console.error(
                    'Failed to remove expired, blacklisted tokens',
                    error,
                );
            }
        },
    },
];

export default jobs;

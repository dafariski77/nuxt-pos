-- Enable Realtime for the transactions table to listen for payment status updates
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

import unittest
from unittest.mock import MagicMock, patch
import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import seed_vps_full

class TestSeedVpsFull(unittest.TestCase):
    @patch('paramiko.SSHClient')
    @patch('os.path.exists')
    @patch('os.listdir')
    def test_main_success(self, mock_listdir, mock_exists, mock_ssh_client):
        # Setup mocks
        mock_ssh = MagicMock()
        mock_ssh_client.return_value = mock_ssh
        
        mock_sftp = MagicMock()
        mock_ssh.open_sftp.return_value = mock_sftp
        
        # We mock os.path.exists to return True
        mock_exists.return_type = True
        
        # We mock listdir to return some .ts and non-.ts files
        mock_listdir.return_value = ['00-roles.ts', '01-users.ts', 'readme.txt']
        
        # Mock ssh.exec_command return values
        mock_stdin = MagicMock()
        mock_stdout = MagicMock()
        mock_stderr = MagicMock()
        
        mock_stdout.channel.recv_exit_status.return_value = 0
        mock_stdout.read.return_value = b"Seed successful"
        mock_stderr.read.return_value = b""
        
        mock_ssh.exec_command.return_value = (mock_stdin, mock_stdout, mock_stderr)
        
        # Run main
        with patch('builtins.print') as mock_print:
            seed_vps_full.main()
            
        # Verify SSH connection details
        mock_ssh_client.assert_called_once()
        mock_ssh.connect.assert_called_once_with(
            '45.119.83.233', 
            username='root', 
            password='Tailoc@2026'
        )
        
        # Verify remote directories creation
        mock_ssh.exec_command.assert_any_call("mkdir -p /var/www/api.demonightlight.test9.io.vn/prisma/seed")
        
        # Verify SFTP calls
        mock_ssh.open_sftp.assert_called_once()
        
        # Check that put was called for seed.ts and the mocked .ts files
        self.assertTrue(mock_sftp.put.called)
        put_calls = mock_sftp.put.call_args_list
        # We expect 3 put calls (seed.ts, 00-roles.ts, 01-users.ts)
        self.assertEqual(len(put_calls), 3)
        
        # Let's extract paths uploaded (normalizing path separators for windows vs remote)
        uploaded_destinations = [call_args[0][1].replace('\\', '/') for call_args in put_calls]
        self.assertIn('/var/www/api.demonightlight.test9.io.vn/prisma/seed.ts', uploaded_destinations)
        self.assertIn('/var/www/api.demonightlight.test9.io.vn/prisma/seed/00-roles.ts', uploaded_destinations)
        self.assertIn('/var/www/api.demonightlight.test9.io.vn/prisma/seed/01-users.ts', uploaded_destinations)
        self.assertNotIn('/var/www/api.demonightlight.test9.io.vn/prisma/seed/readme.txt', uploaded_destinations)
        
        # Verify execute prisma seed command
        mock_ssh.exec_command.assert_any_call("cd /var/www/api.demonightlight.test9.io.vn && npx prisma db seed")
        
        # Verify close connections
        mock_sftp.close.assert_called_once()
        mock_ssh.close.assert_called_once()

    @patch('paramiko.SSHClient')
    def test_main_connection_failure(self, mock_ssh_client):
        mock_ssh = MagicMock()
        mock_ssh_client.return_value = mock_ssh
        mock_ssh.connect.side_effect = Exception("Connection timed out")
        
        # We also need to mock exec_command return value because in the connection failure test,
        # it should NOT be called.
        mock_ssh.exec_command.return_value = (MagicMock(), MagicMock(), MagicMock())
        
        with patch('builtins.print') as mock_print:
            seed_vps_full.main()
            
        mock_ssh.connect.assert_called_once()
        mock_ssh.exec_command.assert_not_called()
        mock_ssh.close.assert_not_called()


if __name__ == '__main__':
    unittest.main()

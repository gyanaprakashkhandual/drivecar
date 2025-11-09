'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Mail,
  UserPlus,
  Trash2,
  Edit2,
  Share2,
  BarChart3,
  Activity,
  Moon,
  Sun,
  Loader2,
  X,
  Check,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Crown,
  Shield,
  User
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const Team = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [teamUsage, setTeamUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  // Modal states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemberActions, setShowMemberActions] = useState(null);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);

  // Form states
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: ''
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member'
  });

  const [updateTeamForm, setUpdateTeamForm] = useState({
    name: '',
    description: ''
  });

  const [settingsForm, setSettingsForm] = useState({
    allowMemberInvites: false,
    requireApprovalForTests: false,
    testExecutionTimeout: 300000,
    retentionDays: 90
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      loadTeams(storedToken);
    }
  }, []);

  const loadTeams = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data.data.teams);
      }
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    if (!createTeamForm.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(createTeamForm)
      });

      if (response.ok) {
        const data = await response.json();
        setTeams([...teams, data.data.team]);
        setSuccess('Team created successfully');
        setShowCreateTeam(false);
        setCreateTeamForm({ name: '', description: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create team');
      }
    } catch (err) {
      setError('Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateTeamForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTeam(data.data.team);
        setTeams(teams.map(t => t._id === data.data.team._id ? data.data.team : t));
        setSuccess('Team updated successfully');
        setShowSettings(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update team');
      }
    } catch (err) {
      setError('Error updating team');
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = async (team) => {
    setSelectedTeam(team);
    setCurrentView('team-details');
    setUpdateTeamForm({ name: team.name, description: team.description || '' });
    await loadTeamMembers(team.slug);
    await loadTeamInvitations(team.slug);
    await loadTeamStatistics(team.slug);
  };

  const loadTeamMembers = async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${slug}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data.members);
      }
    } catch (err) {
      console.log('Failed to load members');
    }
  };

  const loadTeamInvitations = async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${slug}/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.data.invitations.filter(inv => inv.status === 'pending'));
      }
    } catch (err) {
      console.log('Could not load invitations');
    }
  };

  const loadTeamStatistics = async (slug) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${slug}/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data.statistics);
      }
    } catch (err) {
      console.log('Failed to load statistics');
    }
  };

  const inviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(inviteForm)
      });

      if (response.ok) {
        setSuccess('Invitation sent successfully');
        setShowInviteMember(false);
        setInviteForm({ email: '', role: 'member' });
        await loadTeamInvitations(selectedTeam.slug);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Error sending invitation');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Member removed successfully');
        await loadTeamMembers(selectedTeam.slug);
        setShowMemberActions(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to remove member');
      }
    } catch (err) {
      setError('Error removing member');
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (userId, newRole) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/members/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setSuccess('Member role updated successfully');
        await loadTeamMembers(selectedTeam.slug);
        setShowMemberActions(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update role');
      }
    } catch (err) {
      setError('Error updating role');
    } finally {
      setLoading(false);
    }
  };

  const transferOwnership = async (newOwnerId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/transfer-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newOwnerId })
      });

      if (response.ok) {
        setSuccess('Ownership transferred successfully');
        const data = await response.json();
        setSelectedTeam(data.data.team);
        await loadTeamMembers(selectedTeam.slug);
        setShowTransferOwnership(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to transfer ownership');
      }
    } catch (err) {
      setError('Error transferring ownership');
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Invitation cancelled');
        await loadTeamInvitations(selectedTeam.slug);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to cancel invitation');
      }
    } catch (err) {
      setError('Error cancelling invitation');
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('You left the team');
        setCurrentView('teams');
        setSelectedTeam(null);
        setTeams(teams.filter(t => t._id !== selectedTeam._id));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to leave team');
      }
    } catch (err) {
      setError('Error leaving team');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Team deleted successfully');
        setCurrentView('teams');
        setSelectedTeam(null);
        setTeams(teams.filter(t => t._id !== selectedTeam._id));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete team');
      }
    } catch (err) {
      setError('Error deleting team');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/teams/${selectedTeam.slug}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });

      if (response.ok) {
        setSuccess('Settings updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />;
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'member':
        return <User className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'admin':
        return darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'member':
        return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
      default:
        return darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>TeamHub</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setToken('');
                setUser(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                darkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-black'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 py-8 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 border rounded-lg flex items-center gap-3 ${
                darkMode
                  ? 'bg-red-900/20 border-red-800'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <AlertCircle className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-4 p-4 border rounded-lg flex items-center gap-3 ${
                darkMode
                  ? 'bg-green-900/20 border-green-800'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <Check className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams View */}
        {currentView === 'teams' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Teams</h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Manage and organize your teams efficiently
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateTeam(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Team
              </motion.button>
            </div>

            {loading && teams.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            ) : teams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center py-12 px-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}
              >
                <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No teams yet
                </p>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Create your first team to get started
                </p>
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Create Team
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team, idx) => (
                  <motion.div
                    key={team._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => selectTeam(team)}
                    whileHover={{ y: -4 }}
                    className={`p-6 rounded-xl cursor-pointer transition-all border ${
                      darkMode
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <Users className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${getRoleColor(team.userRole)}`}>
                        {getRoleIcon(team.userRole)}
                        {team.userRole}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                      {team.name}
                    </h3>
                    <p className={`text-xs mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {team.description || 'No description added'}
                    </p>
                    <div className={`flex items-center justify-between text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {team.memberCount} members
                      </span>
                      <ChevronDown className="w-3 h-3 rotate-90" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Team Details View */}
        {currentView === 'team-details' && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setCurrentView('teams')}
                  className={`text-sm font-medium mb-3 flex items-center gap-1 transition-all ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  ← Back to Teams
                </button>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                  {selectedTeam.name}
                </h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedTeam.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('activity')}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Activity"
                >
                  <Activity className="w-5 h-5" />
                </motion.button>
                {selectedTeam.userRole === 'owner' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteTeam()}
                    disabled={loading}
                    className={`p-2 rounded-lg transition-all ${
                      loading
                        ? 'opacity-50 cursor-not-allowed'
                        : darkMode
                        ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                        : 'bg-red-100 hover:bg-red-200 text-red-600'
                    }`}
                    title="Delete Team"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-4 mb-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'members'
                    ? darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'
                    : darkMode ? 'text-gray-400 border-transparent' : 'text-gray-600 border-transparent'
                }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                  activeTab === 'settings'
                    ? darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'
                    : darkMode ? 'text-gray-400 border-transparent' : 'text-gray-600 border-transparent'
                }`}
              >
                Settings
              </button>
              {statistics && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                    activeTab === 'analytics'
                      ? darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'
                      : darkMode ? 'text-gray-400 border-transparent' : 'text-gray-600 border-transparent'
                  }`}
                >
                  Analytics
                </button>
              )}
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>
                      Team Members ({members.length})
                    </h2>
                    {(selectedTeam.userRole === 'owner' || selectedTeam.userRole === 'admin') && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowInviteMember(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                      </motion.button>
                    )}
                  </div>

                  {loading && members.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className={`w-6 h-6 animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  ) : members.length === 0 ? (
                    <div className={`text-center py-8 px-4 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No members yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member, idx) => (
                        <motion.div
                          key={member.user._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-lg flex items-center justify-between border ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                              {member.user.name}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {member.user.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </span>
                            {(selectedTeam.userRole === 'owner' || selectedTeam.userRole === 'admin') && member.role !== 'owner' && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowMemberActions(showMemberActions === member.user._id ? null : member.user._id)}
                                  className={`p-1.5 rounded-lg transition-all ${
                                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'
                                  }`}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                {showMemberActions === member.user._id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-20 overflow-hidden border ${
                                      darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                                    }`}
                                  >
                                    <button
                                      onClick={() => setShowTransferOwnership(true)}
                                      className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                                        darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <Crown className="w-3 h-3" />
                                      Transfer Ownership
                                    </button>
                                    <button
                                      onClick={() => {
                                        const newRole = member.role === 'admin' ? 'member' : 'admin';
                                        updateMemberRole(member.user._id, newRole);
                                      }}
                                      className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                                        darkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      {member.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                    </button>
                                    <button
                                      onClick={() => removeMember(member.user._id)}
                                      className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${
                                        darkMode ? 'hover:bg-slate-600 text-red-400' : 'hover:bg-gray-100 text-red-600'
                                      }`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Remove Member
                                    </button>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Invitations */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-lg p-6 border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`font-semibold text-sm mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    <Mail className="w-4 h-4" />
                    Pending Invites ({invitations.length})
                  </h3>
                  {invitations.length === 0 ? (
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No pending invitations
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {invitations.map((inv) => (
                        <motion.div
                          key={inv._id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border ${
                            darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                          }`}
                        >
                          <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {inv.email}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              inv.role === 'admin' 
                                ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                                : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {getRoleIcon(inv.role)}
                              {inv.role}
                            </span>
                            {(selectedTeam.userRole === 'owner' || selectedTeam.userRole === 'admin') && (
                              <button
                                onClick={() => cancelInvitation(inv._id)}
                                className={`text-xs transition-all ${
                                  darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                                }`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-6 border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Team Information
                  </h3>
                  <form onSubmit={updateTeam} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={updateTeamForm.name}
                        onChange={(e) => setUpdateTeamForm({ ...updateTeamForm, name: e.target.value })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-black placeholder-gray-400 focus:border-blue-500'
                        } disabled:opacity-50`}
                        placeholder="Team name"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <textarea
                        value={updateTeamForm.description}
                        onChange={(e) => setUpdateTeamForm({ ...updateTeamForm, description: e.target.value })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className={`w-full px-3 py-2 rounded-lg text-sm border transition-all resize-none ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-black placeholder-gray-400 focus:border-blue-500'
                        } disabled:opacity-50`}
                        placeholder="Team description"
                        rows="3"
                      />
                    </div>
                    {selectedTeam.userRole === 'owner' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Changes
                      </motion.button>
                    )}
                  </form>
                </motion.div>

                {/* Team Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-lg p-6 border ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h3 className={`text-sm font-semibold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Team Settings
                  </h3>
                  <form onSubmit={updateTeamSettings} className="space-y-4">
                    <label className={`flex items-center gap-3 cursor-pointer ${
                      selectedTeam.userRole !== 'owner' ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      <input
                        type="checkbox"
                        checked={settingsForm.allowMemberInvites}
                        onChange={(e) => setSettingsForm({ ...settingsForm, allowMemberInvites: e.target.checked })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className="w-4 h-4 rounded"
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Allow members to invite
                      </span>
                    </label>
                    <label className={`flex items-center gap-3 cursor-pointer ${
                      selectedTeam.userRole !== 'owner' ? 'opacity-50 pointer-events-none' : ''
                    }`}>
                      <input
                        type="checkbox"
                        checked={settingsForm.requireApprovalForTests}
                        onChange={(e) => setSettingsForm({ ...settingsForm, requireApprovalForTests: e.target.checked })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className="w-4 h-4 rounded"
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Require approval for tests
                      </span>
                    </label>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Test Timeout (ms)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.testExecutionTimeout}
                        onChange={(e) => setSettingsForm({ ...settingsForm, testExecutionTimeout: parseInt(e.target.value) })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-black'
                        } disabled:opacity-50`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Retention Days
                      </label>
                      <input
                        type="number"
                        value={settingsForm.retentionDays}
                        onChange={(e) => setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value) })}
                        disabled={selectedTeam.userRole !== 'owner'}
                        className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-gray-300 text-black'
                        } disabled:opacity-50`}
                      />
                    </div>
                    {selectedTeam.userRole === 'owner' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Save Settings
                      </motion.button>
                    )}
                  </form>
                </motion.div>

                {/* Danger Zone */}
                {selectedTeam.userRole === 'owner' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`lg:col-span-2 rounded-lg p-6 border ${
                      darkMode ? 'bg-red-900/10 border-red-800' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    <button
                      onClick={() => leaveTeam()}
                      disabled={loading}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        loading
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                          ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                          : 'bg-red-100 hover:bg-red-200 text-red-600'
                      }`}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                      Leave Team
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && statistics && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className={`rounded-lg p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Projects</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{statistics.totalProjects}</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Active projects</p>
                </div>
                <div className={`rounded-lg p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tests</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{statistics.totalTestRuns}</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Total test runs</p>
                </div>
                <div className={`rounded-lg p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Success Rate</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{statistics.successRate}%</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Passing tests</p>
                </div>
                <div className={`rounded-lg p-6 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Repositories</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{statistics.totalRepositories}</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Connected repos</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {/* Create Team Modal */}
        {showCreateTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateTeam(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Create Team</h2>
                <button onClick={() => setShowCreateTeam(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={createTeam} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={createTeamForm.name}
                    onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 focus:border-blue-500'
                    }`}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={createTeamForm.description}
                    onChange={(e) => setCreateTeamForm({ ...createTeamForm, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border transition-all resize-none ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 focus:border-blue-500'
                    }`}
                    placeholder="Enter team description"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Invite Member Modal */}
        {showInviteMember && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteMember(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Invite Member</h2>
                <button onClick={() => setShowInviteMember(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={inviteMember} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 focus:border-blue-500'
                    }`}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-sm border transition-all ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-gray-50 border-gray-300 text-black'
                    }`}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteMember(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    Send Invite
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Transfer Ownership Modal */}
        {showTransferOwnership && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTransferOwnership(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-xl p-6 max-w-md w-full ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Transfer Ownership</h2>
                <button onClick={() => setShowTransferOwnership(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select a member to transfer ownership to:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {members
                    .filter((m) => m.role !== 'owner')
                    .map((member) => (
                      <motion.button
                        key={member.user._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          transferOwnership(member.user._id);
                          setShowTransferOwnership(false);
                        }}
                        disabled={loading}
                        className={`w-full p-3 rounded-lg text-left text-sm transition-all border ${
                          loading
                            ? 'opacity-50 cursor-not-allowed'
                            : darkMode
                            ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                          {member.user.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {member.user.email}
                        </p>
                      </motion.button>
                    ))}
                </div>
              </div>
              <button
                onClick={() => setShowTransferOwnership(false)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
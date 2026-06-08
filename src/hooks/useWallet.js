// useWallet.js
// Drop this in your src/hooks/ folder (or src/ directly)
// Usage: const { account, profile, connecting, connect, disconnect, shortAddress } = useWallet()

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useWallet() {
  const [account, setAccount] = useState(null)        // full wallet address
  const [profile, setProfile] = useState(null)        // row from profiles table
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  // Shorten address for display: 0x4f3a...d92c
  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : null

  // Fetch or upsert profile row from Supabase
  async function syncProfile(walletAddress) {
    // Try to find existing profile by wallet_address
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, that's ok
      console.error('Profile fetch error:', error)
      return null
    }

    if (data) {
      setProfile(data)
      return data
    }

    // No profile yet — create one (role defaults to null, user sets it on onboarding)
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        wallet_address: walletAddress,
        is_active: true,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Profile create error:', insertError)
      return null
    }

    setProfile(newProfile)
    return newProfile
  }

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install it from metamask.io')
      alert('MetaMask not found. Please install MetaMask to continue.')
      return
    }

    setConnecting(true)
    setError(null)

    try {
      // Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask')
      }

      const walletAddress = accounts[0].toLowerCase()
      setAccount(walletAddress)

      // Switch to Polygon Amoy (chainId 80002) if needed
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13882' }], // 80002 in hex
        })
      } catch (switchError) {
        // Chain not added yet — add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology/'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            }],
          })
        }
        // If user rejected the switch, continue anyway
      }

      // Sync with Supabase profiles table
      await syncProfile(walletAddress)

      // Persist in localStorage so page refresh keeps user connected
      localStorage.setItem('agrichain_wallet', walletAddress)
    } catch (err) {
      console.error('Wallet connect error:', err)
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    setAccount(null)
    setProfile(null)
    localStorage.removeItem('agrichain_wallet')
  }, [])

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const saved = localStorage.getItem('agrichain_wallet')
    if (!saved || !window.ethereum) return

    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === saved) {
        setAccount(saved)
        await syncProfile(saved)
      } else {
        // Wallet changed or disconnected externally
        localStorage.removeItem('agrichain_wallet')
      }
    })
  }, [])

  // Listen for account changes in MetaMask
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        const addr = accounts[0].toLowerCase()
        setAccount(addr)
        localStorage.setItem('agrichain_wallet', addr)
        await syncProfile(addr)
      }
    }

    const handleChainChanged = () => {
      // Reload is the safest approach when chain changes
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [disconnect])

  return {
    account,           // full address e.g. "0x4f3a...d92c" (lowercase)
    profile,           // full profile row from Supabase { id, full_name, role, wallet_address, ... }
    connecting,        // true while MetaMask is opening
    error,             // error message string or null
    connect,           // call this on button click
    disconnect,        // call this on logout
    shortAddress,      // helper: shortAddress(account) → "0x4f3a...d92c"
    isConnected: !!account,
    isFarmer: profile?.role === 'farmer',
    isBuyer: profile?.role === 'buyer',
  }
}
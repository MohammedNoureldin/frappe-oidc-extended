try:
    from importlib.metadata import version as _version
    __version__ = _version("oidc_extended")
except Exception:
    # Fallback for dev/test situations where metadata isn't available
    __version__ = "0.0.0"

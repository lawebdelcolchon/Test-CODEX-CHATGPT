import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loginUser } from "../store/slices/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ 
    email: "admin@cpanel.com", 
    password: "admin123",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
      <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
        {/* Logo */}
        <div className="[&>div]:bg-ui-bg-field [&>div]:text-ui-fg-subtle [&>div]:flex [&>div]:items-center [&>div]:justify-center size-12 [&>div]:size-11 [&>div]:rounded-[10px] bg-ui-button-neutral shadow-buttons-neutral after:button-neutral-gradient relative mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-xl after:inset-0 after:content-['']">
          <div>
            <span className="rounded-[10px] bg-ui-bg-component-hover text-ui-fg-subtle pointer-events-none flex select-none items-center justify-center font-bold text-2xl size-11">
              C
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-4 flex flex-col items-center">
          <h1 className="font-sans font-medium h1-core text-2xl font-semibold text-ui-fg-base mb-2">
            Bienvenido a CPanel Admin
          </h1>
          <p className="font-normal font-sans txt-small text-ui-fg-subtle text-center">
            Inicia sesión para acceder al panel de administración
          </p>
        </div>

        {/* Form */}
        <div className="flex w-full flex-col gap-y-3">
          <form className="flex w-full flex-col gap-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-y-4">
              {/* Email Input */}
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <input
                    className="caret-ui-fg-base hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active disabled:text-ui-fg-disabled disabled:!bg-ui-bg-disabled disabled:placeholder-ui-fg-disabled disabled:cursor-not-allowed aria-[invalid=true]:!shadow-borders-error invalid:!shadow-borders-error [&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden txt-compact-small h-8 px-2 py-1.5 bg-ui-bg-field-component"
                    autoComplete="email"
                    name="email"
                    placeholder="Correo electrónico"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="caret-ui-fg-base hover:bg-ui-bg-field-hover shadow-borders-base placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full appearance-none rounded-md outline-none focus-visible:shadow-borders-interactive-with-active disabled:text-ui-fg-disabled disabled:!bg-ui-bg-disabled disabled:placeholder-ui-fg-disabled disabled:cursor-not-allowed aria-[invalid=true]:!shadow-borders-error invalid:!shadow-borders-error [&::--webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden txt-compact-small h-8 px-2 py-1.5 pr-8 bg-ui-bg-field-component"
                    autoComplete="current-password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="absolute bottom-0 right-0 flex items-center justify-center border-l h-8 w-8">
                    <button
                      className="text-ui-fg-muted hover:text-ui-fg-base focus-visible:text-ui-fg-base focus-visible:shadow-borders-interactive-w-focus active:text-ui-fg-base h-fit w-fit rounded-sm outline-none transition-all"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="sr-only">{showPassword ? 'Hide' : 'Show'} password</span>
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.856 3.277L3.277 11.856M6.123 8.734a2.444 2.444 0 0 1-1.178-1.178m6.41-2.445c.51.607.51 1.406 0 2.013-.905 1.372-2.9 3.66-6.144 3.66-.698 0-1.344-.105-1.932-.295M3.667 5.667C2.287 6.446 1.356 7.493 1.356 8.506c-.4-.607-.4-1.406 0-2.013.905-1.372 2.9-3.66 6.144-3.66 1.125 0 2.145.28 3.027.734" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
                            <path d="M1.356 8.506c-.4-.607-.4-1.406 0-2.013.905-1.372 2.9-3.66 6.144-3.66s5.24 2.287 6.144 3.66c.4.607.4 1.406 0 2.013-.905 1.372-2.9 3.66-6.144 3.66S2.26 9.88 1.356 8.507" />
                            <path d="M7.5 9.944a2.444 2.444 0 1 0 0-4.888 2.444 2.444 0 0 0 0 4.888" />
                          </g>
                          <defs>
                            <clipPath id="a">
                              <path fill="#fff" d="M0 0h15v15H0z" />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-ui-border-base rounded"
                />
                <label htmlFor="rememberMe" className="txt-compact-small text-ui-fg-subtle">
                  Recordarme
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md txt-compact-small">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="transition-fg relative inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:border-ui-border-base disabled:text-ui-fg-disabled disabled:shadow-buttons-neutral disabled:after:hidden after:transition-fg after:absolute after:inset-0 after:content-[''] shadow-buttons-inverted text-ui-contrast-fg-primary bg-ui-button-inverted after:button-inverted-gradient hover:bg-ui-button-inverted-hover hover:after:button-inverted-hover-gradient active:bg-ui-button-inverted-pressed active:after:button-inverted-pressed-gradient focus-visible:!shadow-buttons-inverted-focus txt-compact-small-plus gap-x-1.5 px-3 py-1.5 w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Continuar con Email'}
            </button>
          </form>
        </div>

        {/* Forgot Password Link */}
        <span className="text-ui-fg-muted txt-small my-6">
          ¿Olvidaste la contraseña? -{" "}
          <Link
            className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
            to="/forgot-password"
          >
            Restablecer
          </Link>
        </span>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md w-full">
          <h3 className="txt-compact-small font-semibold text-blue-800 mb-2">
            Credenciales de prueba:
          </h3>
          <div className="txt-compact-small text-blue-700 space-y-1">
            <p><strong>Admin:</strong> admin@cpanel.com / admin123</p>
            <p><strong>Manager:</strong> manager@cpanel.com / manager123</p>
            <p><strong>User:</strong> user@cpanel.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Test para validar el funcionamiento del CryptoService
 * Reemplaza las pruebas de bcrypt para asegurar compatibilidad con Node.js
 */

import { describe, it, expect } from "vitest";
import { CryptoService } from "../services/CryptoService";

describe("CryptoService", () => {
  it("Hash de contraseña básico", async () => {
    const password = "TestPassword123!";
    
    const hash = await CryptoService.hashPassword(password);
    
    expect(hash.length > 50).toBe(true);
    expect(hash.includes(':')).toBe(true);
  });

  it("Verificación de contraseña correcta", async () => {
    const password = "TestPassword123!";
    
    const hash = await CryptoService.hashPassword(password);
    
    const isValid = await CryptoService.verifyPassword(password, hash);
    
    expect(isValid).toBe(true);
  });

  it("Verificación de contraseña incorrecta", async () => {
    const password = "TestPassword123!";
    const wrongPassword = "WrongPassword456!";
    
    const hash = await CryptoService.hashPassword(password);
    
    const isValid = await CryptoService.verifyPassword(wrongPassword, hash);
    
    expect(isValid).toBe(false);
  });

  it("Diferentes contraseñas generan hashes diferentes", async () => {
    const password1 = "Password1!";
    const password2 = "Password2!";
    
    const hash1 = await CryptoService.hashPassword(password1);
    const hash2 = await CryptoService.hashPassword(password2);
    
    expect(hash1 !== hash2).toBe(true);
  });

  it("Misma contraseña genera hashes diferentes (salting)", async () => {
    const password = "SamePassword123!";
    
    const hash1 = await CryptoService.hashPassword(password);
    const hash2 = await CryptoService.hashPassword(password);
    
    expect(hash1 !== hash2).toBe(true);
    
    const isValid1 = await CryptoService.verifyPassword(password, hash1);
    const isValid2 = await CryptoService.verifyPassword(password, hash2);
    
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });

  it("Validación de fortaleza de contraseña", () => {
    const validResult = CryptoService.validatePasswordStrength("ValidPass123!");
    expect(validResult.isValid).toBe(true);
    
    const shortResult = CryptoService.validatePasswordStrength("short");
    expect(shortResult.isValid).toBe(false);
    expect(shortResult.errors.some(e => e.includes("8 caracteres"))).toBe(true);
    
    const noUpperResult = CryptoService.validatePasswordStrength("lowercase123!");
    expect(noUpperResult.isValid).toBe(false);
    
    const noLowerResult = CryptoService.validatePasswordStrength("UPPERCASE123!");
    expect(noLowerResult.isValid).toBe(false);
    
    const noNumberResult = CryptoService.validatePasswordStrength("NoNumbers!");
    expect(noNumberResult.isValid).toBe(false);
    
    const noSpecialResult = CryptoService.validatePasswordStrength("NoSpecialChars123");
    expect(noSpecialResult.isValid).toBe(false);
  });

  it("Generación de tokens seguros", () => {
    const token1 = CryptoService.generateSecureToken();
    const token2 = CryptoService.generateSecureToken();
    
    expect(token1.length > 20).toBe(true);
    expect(token1 !== token2).toBe(true);
    expect(/^[A-Za-z0-9+/]+=*$/.test(token1)).toBe(true);
  });

  it("Manejo de errores", async () => {
    const emptyHashResult = await CryptoService.verifyPassword("password", "");
    expect(emptyHashResult).toBe(false);
    
    const invalidHashResult = await CryptoService.verifyPassword("password", "invalid");
    expect(invalidHashResult).toBe(false);
    
    const malformedHashResult = await CryptoService.verifyPassword("password", "no-colons");
    expect(malformedHashResult).toBe(false);
  });
});

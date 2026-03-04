package com.parqueando.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

  private final SecretKey key;
  private final String issuer;
  private final int expirationMinutes;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.issuer:parqueando}") String issuer,
      @Value("${app.jwt.expirationMinutes:180}") int expirationMinutes
  ) {
    String s = (secret == null ? "" : secret);

    // Asegura mínimo 32 caracteres para HS256
    if (s.length() < 32) {
      s = (s + "0123456789abcdef0123456789abcdef").substring(0, 32);
    }

    this.key = Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8));
    this.issuer = issuer;
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(String subject, Map<String, Object> claims) {
    Instant now = Instant.now();

    return Jwts.builder()
      .issuer(issuer)
      .subject(subject)
      .claims(claims)
      .issuedAt(Date.from(now))
      .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
      // fijamos algoritmo (jjwt 0.12.x)
      .signWith(key, Jwts.SIG.HS256)
      .compact();
  }

  public String getSubject(String token) {
    return Jwts.parser()
      .verifyWith(key)
      .build()
      .parseSignedClaims(token)
      .getPayload()
      .getSubject();
  }

  public Map<String, Object> getClaims(String token) {
    Claims claims = Jwts.parser()
      .verifyWith(key)
      .build()
      .parseSignedClaims(token)
      .getPayload();

    // Claims implementa Map, devolvemos como Map para no romper tu JwtAuthFilter
    return claims;
  }
}
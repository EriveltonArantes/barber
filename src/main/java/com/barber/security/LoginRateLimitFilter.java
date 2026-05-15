package com.barber.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_TENTATIVAS = 5;
    private static final long JANELA_MS = 60_000;

    private final ConcurrentHashMap<String, Queue<Long>> tentativasPorIp = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if ("/api/auth/login".equals(request.getServletPath()) && "POST".equals(request.getMethod())) {
            String ip = request.getRemoteAddr();
            if (!permitirRequisicao(ip)) {
                response.setStatus(429);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"erro\":\"Muitas tentativas de login. Aguarde 1 minuto.\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean permitirRequisicao(String ip) {
        long agora = System.currentTimeMillis();
        Queue<Long> timestamps = tentativasPorIp.computeIfAbsent(ip, k -> new ConcurrentLinkedQueue<>());
        timestamps.removeIf(t -> agora - t > JANELA_MS);

        if (timestamps.size() >= MAX_TENTATIVAS) {
            return false;
        }

        timestamps.add(agora);
        return true;
    }
}

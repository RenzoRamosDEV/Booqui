#!/bin/sh

sleep 45

# Colores
RESET="\033[0m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
MAGENTA="\033[1;35m"
WHITE="\033[1;37m"
GRAY="\033[0;37m"

echo ""
echo -e "${BLUE}============================================================${RESET}"
echo -e "${BLUE}               🚀 MICROSERVICIOS - ENDPOINTS                ${RESET}"
echo -e "${BLUE}============================================================${RESET}"
echo ""

# ===========================================
# USER SERVICE
# ===========================================
echo -e "${CYAN}👤 USER SERVICE (PORT 8080)${RESET}"
echo -e "   ${GREEN}Swagger UI  :${RESET} ${GRAY}http://localhost:8080/swagger-ui.html${RESET}"
echo -e "   ${CYAN}POST        :${RESET} ${GRAY}http://localhost:8080/api/users${RESET}"
echo -e "   ${CYAN}POST login  :${RESET} ${GRAY}http://localhost:8080/api/users/login${RESET}"
echo -e "   ${CYAN}GET all     :${RESET} ${GRAY}http://localhost:8080/api/users${RESET}"
echo -e "   ${CYAN}GET id      :${RESET} ${GRAY}http://localhost:8080/api/users/{id}${RESET}"
echo -e "   ${CYAN}GET email   :${RESET} ${GRAY}http://localhost:8080/api/users/email/{email}${RESET}"
echo -e "   ${CYAN}GET phone   :${RESET} ${GRAY}http://localhost:8080/api/users/phone/{phoneNumber}${RESET}"
echo -e "   ${CYAN}GET role    :${RESET} ${GRAY}http://localhost:8080/api/users/role/{role}${RESET}"
echo -e "   ${CYAN}GET search  :${RESET} ${GRAY}http://localhost:8080/api/users/search/firstname${RESET}"
echo -e "   ${CYAN}GET search  :${RESET} ${GRAY}http://localhost:8080/api/users/search/lastname${RESET}"
echo -e "   ${CYAN}GET search  :${RESET} ${GRAY}http://localhost:8080/api/users/search/fullname${RESET}"
echo -e "   ${CYAN}GET exists  :${RESET} ${GRAY}http://localhost:8080/api/users/exists/email/{email}${RESET}"
echo -e "   ${CYAN}PUT         :${RESET} ${GRAY}http://localhost:8080/api/users/email/{email}${RESET}"
echo -e "   ${CYAN}DELETE      :${RESET} ${GRAY}http://localhost:8080/api/users/email/{email}${RESET}"
echo -e "   ${GREEN}Health      :${RESET} ${GRAY}http://localhost:8080/api/users/health${RESET}"
echo ""

# ===========================================
# EVENT SERVICE
# ===========================================
echo -e "${YELLOW}📅 EVENT SERVICE (PORT 8081)${RESET}"
echo -e "   ${GREEN}Swagger UI  :${RESET} ${GRAY}http://localhost:8081/swagger-ui.html${RESET}"
echo -e "   ${YELLOW}POST        :${RESET} ${GRAY}http://localhost:8081/api/events${RESET}"
echo -e "   ${YELLOW}GET all     :${RESET} ${GRAY}http://localhost:8081/api/events${RESET}"
echo -e "   ${YELLOW}GET id      :${RESET} ${GRAY}http://localhost:8081/api/events/{id}${RESET}"
echo -e "   ${YELLOW}GET email   :${RESET} ${GRAY}http://localhost:8081/api/events/email/{email}${RESET}"
echo -e "   ${YELLOW}GET search  :${RESET} ${GRAY}http://localhost:8081/api/events/search/title${RESET}"
echo -e "   ${YELLOW}GET search  :${RESET} ${GRAY}http://localhost:8081/api/events/search/category${RESET}"
echo -e "   ${YELLOW}GET search  :${RESET} ${GRAY}http://localhost:8081/api/events/search/location${RESET}"
echo -e "   ${YELLOW}GET search  :${RESET} ${GRAY}http://localhost:8081/api/events/search/organized${RESET}"
echo -e "   ${YELLOW}GET exists  :${RESET} ${GRAY}http://localhost:8081/api/events/exists/email/{email}${RESET}"
echo -e "   ${YELLOW}PUT         :${RESET} ${GRAY}http://localhost:8081/api/events/email/{email}${RESET}"
echo -e "   ${YELLOW}DELETE      :${RESET} ${GRAY}http://localhost:8081/api/events/email/{email}${RESET}"
echo -e "   ${YELLOW}PATCH stock :${RESET} ${GRAY}http://localhost:8081/api/events/{eventId}/stock?quantity=N${RESET}"
echo -e "   ${GREEN}Health      :${RESET} ${GRAY}http://localhost:8081/api/events/health${RESET}"
echo ""

# ===========================================
# BOOKING SERVICE
# ===========================================
echo -e "${MAGENTA}🏨 BOOKING SERVICE (PORT 8082)${RESET}"
echo -e "   ${GREEN}Swagger UI  :${RESET} ${GRAY}http://localhost:8082/swagger-ui.html${RESET}"
echo -e "   ${MAGENTA}POST        :${RESET} ${GRAY}http://localhost:8082/api/bookings${RESET}"
echo -e "   ${MAGENTA}GET all     :${RESET} ${GRAY}http://localhost:8082/api/bookings${RESET}"
echo -e "   ${MAGENTA}GET id      :${RESET} ${GRAY}http://localhost:8082/api/bookings/{id}${RESET}"
echo -e "   ${MAGENTA}GET user    :${RESET} ${GRAY}http://localhost:8082/api/bookings/user/{userId}${RESET}"
echo -e "   ${MAGENTA}GET event   :${RESET} ${GRAY}http://localhost:8082/api/bookings/event/{eventId}${RESET}"
echo -e "   ${MAGENTA}GET status  :${RESET} ${GRAY}http://localhost:8082/api/bookings/status/{status}${RESET}"
echo -e "   ${MAGENTA}PATCH       :${RESET} ${GRAY}http://localhost:8082/api/bookings/{id}/confirm${RESET}"
echo -e "   ${MAGENTA}PATCH       :${RESET} ${GRAY}http://localhost:8082/api/bookings/{id}/cancel${RESET}"
echo -e "   ${GREEN}Health      :${RESET} ${GRAY}http://localhost:8082/api/bookings/health${RESET}"
echo ""

# ===========================================
# PAYMENT SERVICE
# ===========================================
echo -e "${BLUE}💳 PAYMENT SERVICE (PORT 8083)${RESET}"
echo -e "   ${GREEN}Swagger UI  :${RESET} ${GRAY}http://localhost:8083/swagger-ui.html${RESET}"
echo -e "   ${BLUE}POST        :${RESET} ${GRAY}http://localhost:8083/api/payments${RESET}"
echo -e "   ${BLUE}GET all     :${RESET} ${GRAY}http://localhost:8083/api/payments${RESET}"
echo -e "   ${BLUE}GET id      :${RESET} ${GRAY}http://localhost:8083/api/payments/{id}${RESET}"
echo -e "   ${BLUE}GET user    :${RESET} ${GRAY}http://localhost:8083/api/payments/user/{userId}${RESET}"
echo -e "   ${BLUE}GET event   :${RESET} ${GRAY}http://localhost:8083/api/payments/event/{eventId}${RESET}"
echo -e "   ${BLUE}GET booking :${RESET} ${GRAY}http://localhost:8083/api/payments/booking/{bookingId}${RESET}"
echo -e "   ${BLUE}GET status  :${RESET} ${GRAY}http://localhost:8083/api/payments/status/{status}${RESET}"
echo -e "   ${GREEN}Health      :${RESET} ${GRAY}http://localhost:8083/api/payments/health${RESET}"
echo ""

# ===========================================
# FRONTEND
# ===========================================
echo -e "${WHITE}🖥️  FRONTEND (PORT 80)${RESET}"
echo -e "   ${GREEN}Home        :${RESET} ${GRAY}http://localhost/${RESET}"
echo -e "   ${GREEN}Eventos     :${RESET} ${GRAY}http://localhost/events${RESET}"
echo -e "   ${GREEN}Detalle     :${RESET} ${GRAY}http://localhost/events/:id${RESET}"
echo -e "   ${GREEN}Carrito     :${RESET} ${GRAY}http://localhost/cart${RESET}"
echo -e "   ${GREEN}Checkout    :${RESET} ${GRAY}http://localhost/checkout${RESET}"
echo -e "   ${GREEN}Login       :${RESET} ${GRAY}http://localhost/login${RESET}"
echo -e "   ${GREEN}Registro    :${RESET} ${GRAY}http://localhost/register${RESET}"
echo -e "   ${GREEN}Admin       :${RESET} ${GRAY}http://localhost/admin${RESET}"
echo -e "   ${GREEN}Contacto    :${RESET} ${GRAY}http://localhost/contact${RESET}"
echo -e "   ${GREEN}Mis Reservas:${RESET} ${GRAY}http://localhost/my-bookings${RESET}"
echo ""

echo -e "${GREEN}✔ Todos los servicios inicializados correctamente${RESET}"
echo ""
